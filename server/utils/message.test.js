const expect = require('expect');

const { generateMessage } = require('./message.js');

describe('generateMessage', () => {
    it('should generate the correct message object', () => {
        const message = generateMessage(`Neal`, `Test Message`);
        expect(message).toInclude({
            from: 'Neal',
            text: 'Test Message'
        });
        expect(message.createdAt).toBeA('number');
    });
});
