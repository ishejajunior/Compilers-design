// Define the token types
var TokenType;
(function (TokenType) {
    TokenType["PARSER_ID"] = "ID";
    TokenType["PARSER_NUMBER"] = "NUMBER";
    TokenType["PARSER_WHITESPACE"] = "WHITESPACE";
    TokenType["PARSER_PUNCTUATION"] = "PUNCTUATION";
    TokenType["PARSER_KEYWORD"] = "KEYWORD";
    TokenType["PARSER_STRING"] = "STRING";
    TokenType["PARSER_OPENING_BLOCK"] = "Opening Block";
    TokenType["PARSER_CLOSING_BLOCK"] = "Closing Block";
    TokenType["PARSER_DTYPE"] = "DataType";
    TokenType["PARSER_BOOLOP"] = "Boolean Operator";
    TokenType["PARSER_BOOLVAL"] = "Boolean value";
    TokenType["PARSER_INTOP"] = "Additition Sign";
    TokenType["PARSER_WhileState"] = "While Statement";
    TokenType["PARSER_PrintState"] = "Print Statement";
    TokenType["PARSER_IfState"] = "If statement";
    TokenType["PARSER_Assigment"] = "Equal Sign";
    TokenType["PARSER_EoP"] = "End of program";
})(TokenType || (TokenType = {}));
class Parser {
    tokens;
    currentProgramIndex;
    currentTokenIndex;
    currentToken;
    constructor(tokens) {
        this.tokens = tokens;
        this.currentProgramIndex = 0;
        this.currentTokenIndex = 0;
        this.currentToken = this.tokens[this.currentProgramIndex][this.currentTokenIndex];
    }
    advance() {
        this.currentTokenIndex++;
        if (this.currentTokenIndex >= this.tokens[this.currentProgramIndex].length) {
            this.currentProgramIndex++;
            this.currentTokenIndex = 0;
        }
        if (this.currentProgramIndex >= this.tokens.length) {
            this.currentToken = null;
        }
        else {
            this.currentToken = this.tokens[this.currentProgramIndex][this.currentTokenIndex];
        }
    }
    error(message) {
        console.error(`Parsing Error: ${message}`);
        console.log(this.currentToken);
    }
    parseProgram() {
        console.log("INFO Parser: Parsing Program...");
        while (this.currentToken && this.currentToken.type === TokenType.OPENING_BLOCK) {
            console.log("INFO Parser: Parsing Block");
            this.parseBlock();
        }
        // Check for end-of-program token
        if (this.currentToken && this.currentToken.type === TokenType.PARSER_EoP) {
            console.log("INFO Parser: Program Parsed Successfully!");
        }
        else {
            this.error("Expected End of Program");
        }
    }
    parseBlock() {
        console.log("INFO Parser: Parsing Block...");
        // Display that it's parsing a block
        this.match(TokenType.OPENING_BLOCK);
        // Parse statements within the block
        while (this.currentToken && this.currentToken.type !== TokenType.CLOSING_BLOCK) {
            console.log("INFO Parser: Parsing Statement");
            this.parseStatement();
        }
        // Check for closing block
        this.match(TokenType.CLOSING_BLOCK);
        console.log("INFO Parser: Block Parsed Successfully!");
    }
    parseStatement() {
        console.log("INFO Parser: Parsing Statement...");
        switch (this.currentToken?.type) {
            case TokenType.PrintState:
                this.parsePrintStatement();
                break;
            case TokenType.ID:
                this.parseAssignmentStatement();
                break;
            case TokenType.DTYPE:
                this.parseVarDecl();
                break;
            case TokenType.WhileState:
                this.parseWhileStatement();
                break;
            case TokenType.IfState:
                this.parseIfStatement();
                break;
            case TokenType.OPENING_BLOCK:
                this.parseBlock();
                break;
            default:
                this.error("Invalid Statement");
        }
        console.log("INFO Parser: Statement Parsed Successfully!");
    }
    parsePrintStatement() {
        console.log("INFO Parser: Parsing Print Statement...");
        this.match(TokenType.PrintState);
        this.match(TokenType.PUNCTUATION); // Opening Parenthesis
        this.parseExpr();
        this.match(TokenType.PUNCTUATION); // Closing Parenthesis
        console.log("INFO Parser: Print Statement Parsed Successfully!");
    }
    parseAssignmentStatement() {
        console.log("INFO Parser: Parsing Assignment Statement...");
        this.match(TokenType.ID);
        this.match(TokenType.Assigment);
        this.parseExpr();
        console.log("INFO Parser: Assignment Statement Parsed Successfully!");
    }
    parseVarDecl() {
        console.log("INFO Parser: Parsing Variable Declaration...");
        this.match(TokenType.DTYPE);
        this.match(TokenType.ID);
        console.log("INFO Parser: Variable Declaration Parsed Successfully!");
    }
    parseWhileStatement() {
        console.log("INFO Parser: Parsing While Statement...");
        this.match(TokenType.WhileState);
        this.parseBooleanExpr();
        this.parseBlock();
        console.log("INFO Parser: While Statement Parsed Successfully!");
    }
    parseIfStatement() {
        console.log("INFO Parser: Parsing If Statement...");
        this.match(TokenType.IfState);
        this.parseBooleanExpr();
        this.parseBlock();
        console.log("INFO Parser: If Statement Parsed Successfully!");
    }
    parseExpr() {
        console.log("INFO Parser: Parsing Expression...");
        if (this.currentToken &&
            (this.currentToken.type === TokenType.NUMBER ||
                this.currentToken.type === TokenType.STRING ||
                this.currentToken.type === TokenType.BOOLVAL ||
                this.currentToken.type === TokenType.ID)) {
            this.advance();
        }
        else {
            this.error("Invalid Expression");
        }
        console.log("INFO Parser: Expression Parsed Successfully!");
    }
    parseBooleanExpr() {
        console.log("INFO Parser: Parsing Boolean Expression...");
        this.match(TokenType.OPENING_BLOCK);
        this.parseExpr();
        this.match(TokenType.BOOLOP);
        this.parseExpr();
        this.match(TokenType.CLOSING_BLOCK);
        console.log("INFO Parser: Boolean Expression Parsed Successfully!");
    }
    match(tokenType) {
        if (this.currentToken && this.currentToken.type === tokenType) {
            this.advance();
        }
        else {
            this.error(`Expected ${tokenType} but found ${this.currentToken?.type}`);
        }
    }
}
// Example usage
const tokens = [[ /* Populate with your tokens */]];
const parser = new Parser(tokens);
parser.parseProgram();
//# sourceMappingURL=Parser.js.map