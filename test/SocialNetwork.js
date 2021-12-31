const { assert } = require("chai");
const { default: Web3 } = require("web3");
const SocialNetwork = artifacts.require('./SocialNetwork.sol');
require('chai')
    .use(require('chai-as-promised'))
    .should()
contract('SocialNetwork', ([deployer,author,tipper]) => {
    let socialNetwork
    before(async () => {
         socialNetwork = await SocialNetwork.deployed()
    })
    describe('deployment', async() => {
        it('deployes sucess', async () => {
            const address = await SocialNetwork.address
            assert.notEqual(address, 0x0)
            assert.notEqual( address, '')
            assert.notEqual( address, null)
            assert.notEqual( address, undefined)
        })
        it('has a name', async () => {
            const name = await socialNetwork.name()
            assert.equal(name,'Social Network')
        })
    })
    describe('post', async () => {
        let result, postcount
         before(async () => {
         result=await socialNetwork.createPost('this is my first post',{from: author})
            postcount = await socialNetwork.postcount()
    })
        it('creates posts', async () => {
            //sucess
            assert.equal(postcount, 1)
            const event=result.logs[0].args
            assert.equal(event.id.toNumber(), postcount.toNumber(), 'id is correct')
            assert.equal(event.content, 'this is my first post', 'content is correct')
            assert.equal(event.tipAmount, 0, 'tipammount is correct')
            assert.equal(event.author, author, 'author is correct')
            //failuer
            await socialNetwork.createPost('', { from: author }).should.be.rejected;
        })
        it('lists post', async () => {
            const post= await socialNetwork.posts(postcount)
            assert.equal(post.id.toNumber(), postcount.toNumber(), 'id is correct')
            assert.equal(post.content, 'this is my first post', 'content is correct')
            assert.equal(post.tipAmount, 0, 'tipammount is correct')
            assert.equal(post.author, author, 'author is correct')
        })
        it('allow user to tip posts', async () => {
              // Track the author balance before purchase
               let oldAuthorBalance
              oldAuthorBalance = await web3.eth.getBalance(author)
              oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)
            result= await socialNetwork.tipPost(postcount,{from: tipper,value: web3.utils.toWei('1', 'Ether')})
            // SUCESS
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), postcount.toNumber(), 'id is correct')
            assert.equal(event.content, 'this is my first post', 'content is correct')
            assert.equal(event.tipAmount, '1000000000000000000', 'tipammount is correct')
            assert.equal(event.author, author, 'author is correct') 
            // Check that author received funds
            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)

            let tipAmount
            tipAmount = web3.utils.toWei('1', 'Ether')
            tipAmount = new web3.utils.BN(tipAmount)
            const exepectedBalance = oldAuthorBalance.add(tipAmount)

            assert.equal(newAuthorBalance.toString(), exepectedBalance.toString())

           // FAILURE: Tries to tip a post that does not exist
           await socialNetwork.tipPost(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;

        })
    })
    
})