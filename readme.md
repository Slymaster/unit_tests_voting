# Unit tests

Unit tests of the smart contract Voting.

## Description

Tests of the different return possibilities (event, revert).

## Functions tested

Unit tests of the following functions :<br />
<br />
    <b>RegisteringVoters</b> <br />
      ✓ addVoter <br />
      ✓ getVoter <br />
    <b>ProposalsRegistrationStarted</b> <br />
      ✓ addProposal <br />
      ✓ getProposal <br />
    <b>Voting session, tally votes and get winner</b> <br />
      ✓ setVote <br /> 
      ✓ tallyVotes <br />
      ✓ getWinner <br />
    <b>State</b> <br />
      ✓ startProposalsRegistering <br />
      ✓ endProposalsRegistering <br />
      ✓ startVotingSession <br />
      ✓ endVotingSession <br />

## Getting Started

### Installing

* Truffle

### Instructions

* Launch a terminal in the root directory and type this command:
```
truffle test test/voting.test.js
```
