const { expect } = require("chai");

const fs = require('fs');

const proofs = []
const prooflist = fs.readdirSync("proofs/registration");
prooflist.forEach(function (f) {
    proofs.push(require("../proofs/registration/" + f));
});

describe("Register", function () {
    let signer = {
        "tester": null
    };
    let contract = {
        "verifier": null
    };

    async function set(verbose = true) {
        [signer.tester] = await ethers.getSigners();

        let balanceOfTestter = await signer.tester.getBalance() / (10 ** 18);
        console.log("Tester:\t", signer.tester.address, `(${balanceOfTestter} ETH)`);
    }

    async function deploy() {
        process.stdout.write("Deploy Verifier");
        const Verifier = await ethers.getContractFactory("contracts/r_verifier.sol:Verifier", signer.tester);
        contract.verifier = await Verifier.deploy();
        await contract.verifier.deployed();
        console.log(":\t", contract.verifier.address);
    }

    describe("Test", function () {
        it("Verify", async function () {
            await set();
            await deploy();

            for (let proof of proofs) {
                let r = await contract.verifier.verifyTx(
                    proof.proof,
                    proof.inputs
                );
                await r.wait();
                // expect(r).to.equal(true);
            }
        });
    });
});
