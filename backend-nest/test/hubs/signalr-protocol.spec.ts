import {
  encodeMessage,
  invocation,
  parseHandshake,
  parseHubMessage,
  RECORD_SEPARATOR,
  splitRecords,
} from '../../src/api/hubs/signalr/signalr-protocol';

describe('SignalRProtocolTests', () => {
  it('EncodeMessage_TerminatesWithRecordSeparator', () => {
    expect(encodeMessage(invocation('roomDeleted', [5]))).toBe(
      `{"type":1,"target":"roomDeleted","arguments":[5]}${RECORD_SEPARATOR}`,
    );
  });

  it('SplitRecords_KeepsIncompleteTrailingRecord', () => {
    const { records, remainder } = splitRecords(`{"protocol":"json","version":1}\x1e{"type":6}\x1e{"type":`);

    expect(records).toEqual(['{"protocol":"json","version":1}', '{"type":6}']);
    expect(remainder).toBe('{"type":');
  });

  it('Parse_HandlesInvalidInputDefensively', () => {
    expect(parseHandshake('{"protocol":"json","version":1}')).toEqual({ protocol: 'json', version: 1 });
    expect(parseHandshake('{"protocol":"json"}')).toBeNull();
    expect(parseHandshake('not json')).toBeNull();
    expect(parseHubMessage('{"type":6}')).toEqual({ type: 6 });
    expect(parseHubMessage('{"target":"x"}')).toBeNull();
  });
});
