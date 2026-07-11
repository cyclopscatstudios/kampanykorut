import { Answer, CampaignState } from "@/shared/types";
import { mockCandidateListData, mockPartyListData } from "./mockListData";

export const campaignState: CampaignState = {
  activeCampaignId: "1995_test_campaign_id",
  playerSide: {
    partyId: "party_a",
    candidateId: "candidate_a",
  },
  isBaseResultsAlreadyApplied: false,
  turn: 8,
  currentQuestion: {
    id: "1995_test_question_id",
    title: "Question title",
    question: "To be, or not to be: that is the question.",
    possibleAnswers: [
      {
        id: "A",
        label:
          "This is an answer with id A, and it is a very good answer that will lead to victory.",
      },
      {
        id: "B",
        label:
          "This is an answer with id B, and it is a decent answer that will lead to a close defeat.",
      },
      {
        id: "C",
        label:
          "This is an answer with id C, and it is a moderately good answer that will lead to a moderate outcome.",
      },
      {
        id: "D",
        label:
          "This is an answer with id D, and it is a poor answer that will lead to a defeat.",
      },
    ],
  },
  candidateListData: mockCandidateListData,
  partyListData: mockPartyListData,
  answerEffects: [
    {
      id: "A",
      effects: [
        {
          type: "uniform-swing",
          params: {
            party_a: -1.4,
            party_b: 1,
            party_c: 0.4,
          },
        },
        {
          type: "turnout-change",
          params: {
            party_a: -0.8,
          },
        },
      ],
    },
    {
      id: "B",
      effects: [
        {
          type: "uniform-swing",
          params: {
            party_a: 0.4,
          },
        },
      ],
    },
    {
      id: "C",
      effects: [
        {
          type: "uniform-swing",
          params: {
            party_a: 1.8,
            party_b: -1,
          },
        },
        {
          type: "turnout-change",
          params: {
            party_a: 0.8,
          },
        },
        {
          type: "district-vote-transfer",
          params: [
            {
              groupId: "ellenzeki_vezetesu_oevk",
              targetParty: "party_a",
              amount: 1000,
              from: {
                type: "party",
                party: "fidesz",
              },
            },
            {
              groupId: "ellenzeki_vezetesu_oevk",
              targetParty: "party_b",
              amount: 1000,
              from: {
                type: "bizonytalan",
              },
            },
          ],
        },
      ],
    },
    {
      id: "D",
      effects: [
        {
          type: "turnout-change",
          params: {
            party_a: 0.5,
          },
        },
      ],
    },
  ] as Answer[],
  results: {
    totals: {
      candidateListResults: {
        party_a: 5000,
        party_b: 4000,
        party_c: 3000,
      },
      partyListResults: {
        party_a: 5000,
        party_b: 4000,
        party_c: 3000,
      }
    },
    mandates: [
      {
        party: "party_a",
        constituencySeats: 48,
        listSeats: 43,
        totalSeats: 91,
      },
      {
        party: "party_b",
        constituencySeats: 58,
        listSeats: 43,
        totalSeats: 101,
      },
      {
        party: "party_c",
        constituencySeats: 0,
        listSeats: 7,
        totalSeats: 7,
      },
    ],
    constituencySeats: {
      party_a: 48,
      party_b: 58,
    },
    listSeats: {
      party_a: 43,
      party_b: 43,
      party_c: 7,
    },
    compensation: {
      losingVotes: {
        party_a: 947068,
        party_b: 126648,
        party_c: 307064,
      },
      winnerCompensation: {
        party_a: 375288,
        party_b: 397689,
      },
      total: {
        party_a: 1344757,
        party_b: 126648,
        party_c: 307064,
      },
    },
    percentages: {
      candidateListResults: {
        party_a: 0.44456823645102844,
        party_b: 0.4487724331063556,
        party_c: 0.02375856043924297,
      },
      partyListResults: {
        party_a: 0.44456823645102844,
        party_b: 0.4487724331063556,
        party_c: 0.02375856043924297,
      }
    },
  },
  isEnded: false,
  advisorFeedback: {
    answerId: "B",
    text: "Your advisor thinks that this answer is decent, but it could have been better. They suggest that you should have chosen answer A, which would have given you a better chance at winning the election.",
  },
};
