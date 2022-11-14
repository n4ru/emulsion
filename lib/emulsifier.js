/*

Emulsion helps you with common EVM-manipulation related tasks to
ensure your tests run in as close to the production environment as possible.

*/


const { VM } = require('@ethereumjs/vm');

module.exports = class Emulsifier {
    

    constructor(provider) {
        this.provider = provider;
        this.send = (method, params = []) => {
            return new Promise((resolve, reject) => {
                // eslint-disable-next-line no-undef
                this.provider.send({
                    jsonrpc: '2.0',
                    id: Date.now(),
                    method,
                    params,
                }, (err, res) => {
                    return err ? reject(err) : resolve(res)
                })
            })
        }
    }

    checkVM = async () => {
        if (!this.vm) this.vm = (await VM.create({ chain: (await this.send('eth_chainId')) }));
    }

    replaceContract = async (address, bytecode, opts) => {
        await this.checkVM(); // Ensure VM is ready
        let deployedBytecode = await this.vm.evm.runCode(bytecode, opts);
        return await this.send('evm_setAccountCode', [address, deployedBytecode]);
    }

    unlockAccount = async (address) => {
        await this.send('evm_addAccount', [address, '']);
        return await this.send('personal_unlockAccount', [address, '']);
    }

    takeSnapshot = async () => {
        return await this.send('evm_snapshot')
    }

    traceTransaction = async (tx) => {
        return await this.send('debug_traceTransaction', [tx, {}])
    }

    revertSnapshot = async (id) => {
        await this.send('evm_revert', [id])
    }

    mineBlock = async (timestamp) => {
        await this.send('evm_mine', [timestamp])
    }

    increaseTime = async (seconds) => {
        await this.send('evm_increaseTime', [seconds])
    }

    minerStop = async () => {
        await this.send('miner_stop', [])
    }

    minerStart = async () => {
        await this.send('miner_start', [])
    }

}