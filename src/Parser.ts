interface Token {
    char: string;
    type: TokenType;
    position: { line: number; column: number };
    error?: string;
    warning?: string;
}

// Define the token types
enum TokenType {
    PARSER_ID = "ID",
    PARSER_NUMBER = "NUMBER",
    PARSER_WHITESPACE = "WHITESPACE",
    PARSER_PUNCTUATION = "PUNCTUATION",
    PARSER_KEYWORD = "KEYWORD",
    PARSER_STRING = "STRING",
    PARSER_OPENING_BLOCK = "Opening Block",
    PARSER_CLOSING_BLOCK = "Closing Block",
    PARSER_DTYPE = "DataType",
    PARSER_BOOLOP = "Boolean Operator",
    PARSER_BOOLVAL = "Boolean value",
    PARSER_INTOP = "Additition Sign",
    PARSER_WhileState = "While Statement",
    PARSER_PrintState = "Print Statement",
    PARSER_IfState = "If statement",
    PARSER_Assigment = "Equal Sign",
    PARSER_EoP = "End of program"
}

class Parser {
    tokens: Token[][];
    currentProgramIndex: number;
    currentTokenIndex: number;
    currentToken: Token | null;

    constructor(tokens: Token[][]) {
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
        } else {
            this.currentToken = this.tokens[this.currentProgramIndex][this.currentTokenIndex];
        }
    }

    error(message: string) {
        console.error(`Parsing Error: ${message}`);
        console.log(this.currentToken)
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
        } else {
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
        } else {
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

    match(tokenType: TokenType) {
        if (this.currentToken && this.currentToken.type === tokenType) {
            this.advance();
        } else {
            this.error(`Expected ${tokenType} but found ${this.currentToken?.type}`);
        }
    }
}

// Example usage
const tokens: Token[][] = [[/* Populate with your tokens */]];
const parser = new Parser(tokens);
parser.parseProgram();
