const expect = require('expect');

const { generateMessage, generateLocationMessage } = require('./message.js');

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

describe('generateLocationMessage', () => {
    it('should generate correct location object', () => {
        const message = generateLocationMessage(`Neal`, 1, 2);
        expect(message).toInclude({
            from: `Neal`,
            url: `https://www.google.com/maps?q=1,2`
        });
        expect(message.createdAt).toBeA(`number`);
    });
});
