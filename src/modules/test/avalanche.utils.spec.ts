import { formatTransferData } from "../avalanche/avalanche.utils";

describe('formatTransferData', () => {
    it('should return an empty array when given an empty array', () => {
      expect(formatTransferData([],18)).toEqual([]);
    });
  
    it('should return an array with the correct format when given an array of events', () => {
      const events = [
        {
          args: {
            from: '0x1234567890abcdef',
            to: '0xfedcba9876543210',
            value: '1000000000000000000',
          },
          transactionHash: '0x1234567890abcdef',
          blockNumber: 123456,
        },
      ];
  
      const expected = [
        {
          from: '0x1234567890abcdef',
          to: '0xfedcba9876543210',
          value: '1.0',
          transactionHash: '0x1234567890abcdef',
          blockNumber: 123456,
        },
      ];
  
      expect(formatTransferData(events,18)).toEqual(expected);
    });
  });
