const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Voting = artifacts.require('Voting');

contract('Voting', function (accounts) {
    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const voter3 = accounts[3];
    const voter4 = accounts[4];

    beforeEach(async function () {
        this.VotingInstance = await Voting.new({ from: owner });
        await this.VotingInstance.addVoter(voter1, { from: owner });
        await this.VotingInstance.addVoter(voter2, { from: owner });
    });

    context('RegisteringVoters', function() {

        it('addVoter', async function () {
            await expectRevert(this.VotingInstance.getVoter(voter1, { from: voter4 }), "You're not a voter");
            let addVoter = await this.VotingInstance.addVoter(voter3, { from: owner });
            await expectRevert(this.VotingInstance.addVoter(voter3, { from: owner }), "Already registered");
            expectEvent(addVoter, 'VoterRegistered', { voterAddress: voter3 });
        });

        it('getVoter', async function () {
            let isVoterRegistered = await this.VotingInstance.getVoter(voter1, { from: voter2 }).isRegistered;
            expect(isVoterRegistered).to.equal(Boolean.true);
        });

    });

    context('ProposalsRegistrationStarted', function() {

        let descProposal;
        let proposal;

        beforeEach(async function () {
            await this.VotingInstance.startProposalsRegistering({ from: owner });
            descProposal = "Proposal 1";
            proposal = await this.VotingInstance.addProposal(descProposal, { from: voter1 });
        });

        it('addProposal', async function () {
            await expectRevert(this.VotingInstance.addProposal("", { from: voter1 }), "Vous ne pouvez pas ne rien proposer");
            expectEvent(proposal, 'ProposalRegistered', { proposalId: new BN(0) });
        });

        it('getProposal', async function () {
            let oneProposal = await this.VotingInstance.getOneProposal(0);
            expect(oneProposal.description).to.be.equal(descProposal);
        });

    });

    context('Voting session, tally votes and get winner', function() {

        let vote;

        beforeEach(async function () {
            await expectRevert(this.VotingInstance.addProposal("Proposal 1", { from: voter1 }), 'Proposals are not allowed yet');
            await this.VotingInstance.startProposalsRegistering({ from: owner });
            this.VotingInstance.addProposal("Proposal 1", { from: voter1 });
            this.VotingInstance.addProposal("Proposal 2", { from: voter2 });
            await this.VotingInstance.endProposalsRegistering({ from: owner });
            await expectRevert(this.VotingInstance.setVote(0, { from: voter1 }), 'Voting session havent started yet');
            await this.VotingInstance.startVotingSession({ from: owner });
            vote = await this.VotingInstance.setVote(0, { from: voter1 });
        });

        it('setVote', async function () {
            await expectRevert(this.VotingInstance.setVote(1, { from: voter1 }), "You have already voted");
            await expectRevert(this.VotingInstance.setVote(10, { from: voter2 }), "Proposal not found");
            expectEvent(vote, 'Voted', { voter: voter1, proposalId: new BN(0) });
        });

        it('tallyVotes', async function () {
            await expectRevert(this.VotingInstance.tallyVotes({ from: owner }), "Current status is not voting session ended");
            await this.VotingInstance.endVotingSession({ from: owner });
            let tallyVotes = await this.VotingInstance.tallyVotes({ from: owner });
            expectEvent(tallyVotes, 'WorkflowStatusChange', { previousStatus: new BN(4), newStatus: new BN(5) });
        });

        it('getWinner', async function () {
            await expectRevert(this.VotingInstance.getWinner(), "Votes are not tallied yet");
            await this.VotingInstance.endVotingSession({ from: owner });
            await this.VotingInstance.tallyVotes({ from:owner });
            let winner = await this.VotingInstance.getWinner();
            let oneProposal = await this.VotingInstance.getOneProposal(0, { from: voter1 });
            expect(winner).to.be.eql(oneProposal);
        });

    });

    context('State', function() {

        it('startProposalsRegistering', async function () {
            let startProposalsRegistering = await this.VotingInstance.startProposalsRegistering({ from: owner }); 
            expectEvent(startProposalsRegistering, 'WorkflowStatusChange', { previousStatus: new BN(0), newStatus: new BN(1) });
            await expectRevert(this.VotingInstance.startProposalsRegistering({ from: owner }), "Registering proposals cant be started now");
        });

        it('endProposalsRegistering', async function () {
            await expectRevert(this.VotingInstance.endProposalsRegistering({ from: owner }), "Registering proposals havent started yet");
            await this.VotingInstance.startProposalsRegistering({ from: owner });
            let endProposalsRegistering = await this.VotingInstance.endProposalsRegistering({ from: owner }); 
            expectEvent(endProposalsRegistering, 'WorkflowStatusChange', { previousStatus: new BN(1), newStatus: new BN(2) });
        });

        it('startVotingSession', async function () {
            await expectRevert(this.VotingInstance.startVotingSession({ from: owner }), "Registering proposals phase is not finished");
            await this.VotingInstance.startProposalsRegistering({ from: owner });
            await this.VotingInstance.endProposalsRegistering({ from: owner });
            let startVotingSession = await this.VotingInstance.startVotingSession({ from: owner }); 
            expectEvent(startVotingSession, 'WorkflowStatusChange', { previousStatus: new BN(2), newStatus: new BN(3) });
        });

        it('endVotingSession', async function () {
            await expectRevert(this.VotingInstance.endVotingSession({ from: owner }), "Voting session havent started yet");
            await this.VotingInstance.startProposalsRegistering({ from: owner });
            await this.VotingInstance.endProposalsRegistering({ from: owner });
            await this.VotingInstance.startVotingSession({ from: owner });
            let endVotingSession = await this.VotingInstance.endVotingSession({ from: owner }); 
            expectEvent(endVotingSession, 'WorkflowStatusChange', { previousStatus: new BN(3), newStatus: new BN(4) });
        });

    });
        
});
