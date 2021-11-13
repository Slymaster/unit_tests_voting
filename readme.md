# Project Title

Tests unitaires du smart contract Voting

## Description

Tests des différentes possibilités de retours (event, revert).

## Description

Tests des fonctionnalités :
    RegisteringVoters
      ✓ addVoter
      ✓ getVoter
    ProposalsRegistrationStarted
      ✓ addProposal
      ✓ getProposal
    Voting session, tally votes and get winner
      ✓ setVote
      ✓ tallyVotes
      ✓ getWinner
    State
      ✓ startProposalsRegistering
      ✓ endProposalsRegistering
      ✓ startVotingSession
      ✓ endVotingSession

## Getting Started

### Installing

* Truffle

### Instructions

* Launch a terminal in the root directory and type this command:
```
truffle test test/voting.test.js
```