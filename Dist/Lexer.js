// Define the token types
var TokenType;
(function (TokenType) {
    TokenType["ID"] = "ID";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["WHITESPACE"] = "WHITESPACE";
    TokenType["PUNCTUATION"] = "PUNCTUATION";
    TokenType["KEYWORD"] = "KEYWORD";
    TokenType["STRING"] = "STRING";
    TokenType["OPENING_BLOCK"] = "Opening Block";
    TokenType["CLOSING_BLOCK"] = "Closing Block";
    TokenType["DTYPE"] = "DataType";
    TokenType["BOOLOP"] = "Boolean Operator";
    TokenType["BOOLVAL"] = "Boolean value";
    TokenType["INTOP"] = "Additition Sign";
    TokenType["WhileState"] = "While Statement";
    TokenType["PrintState"] = "Print Statement";
    TokenType["IfState"] = "If statement";
    TokenType["Assigment"] = "Equal Sign";
    TokenType["EoP"] = "End of program";
})(TokenType || (TokenType = {}));



// Function to perform lexical analysis
function lex(input) {
    const programs = lexPrograms(input);
    let output = "";
    programs.forEach((program, index) => {
        output += `Program ${index + 1}:\n`;
        let errorsExist = false;
        let warningExist = false;
        program.forEach(token => {
            if (token.warning) {
                warningExist = true;
                output += `Warning: ${token.warning} at line ${token.position.line}:${token.position.column}\n`;
            }
            else if (token.error) {
                errorsExist = true;
                output += `Error - ${token.error} at line ${token.position.line}:${token.position.column}\n`;
            }
            else {
                let tokenDescription = "";
                if (token.type === TokenType.KEYWORD) {
                    tokenDescription = `Keyword "${token.char}"`;
                }
                else if (token.type === TokenType.WHITESPACE) {
                    return;
                }
                else {
                    tokenDescription = `Debug-Lexer- [ ${token.char} ], Type: ${token.type}`;
                }
                output += `${tokenDescription}, found at (${token.position.line}:${token.position.column})\n`;
            }
        });
        if (!errorsExist && !warningExist) {
            output += "No errors or warnings found.\n\n";
        }
    });
    console.log(programs);
    return output;
}
// Function to perform lexical analysis on multiple programs
function lexPrograms(input) {
    const sourceCode = input.trim();
    const programs = [[]];
    let line = 1;
    let column = 1;
    let currentProgramIndex = 0;
    let insideComment = false;
    let insideString = false;
    let currentStringLiteral = "";
    let eopFound = false;
    let openSymbolsStack = [];
    // Function to skip whitespace characters
    function skipWhitespace(input, currentIndex) {
        let index = currentIndex;
        while (index < input.length && /\s/.test(input[index])) {
            if (input[index] === '"') {
                const nextQuoteIndex = input.indexOf('"', index + 1);
                if (nextQuoteIndex !== -1) {
                    index = nextQuoteIndex + 1;
                }
                else {
                    return index;
                }
            }
            else {
                index++;
            }
        }
        return index;
    }
    // Function to create an error token
    function createErrorToken(char, line, column, errorMessage) {
        return {
            char,
            type: TokenType.PUNCTUATION,
            position: { line, column },
            error: `Invalid character "${char}" (${errorMessage})`
        };
    }
    // Function to read a number token
    function readNumberToken(sourceCode, currentIndex, line, column) {
        let index = currentIndex;
        let currentNumber = sourceCode[index];
        let newIndex = index + 1;
        while (/^[0-9]+$/.test(sourceCode[newIndex]) && newIndex < sourceCode.length) {
            currentNumber += sourceCode[newIndex];
            newIndex++;
        }
        return {
            token: { char: currentNumber, type: TokenType.NUMBER, position: { line, column } },
            newIndex: newIndex - 1
        };
    }
    // Function to read an identifier or keyword token
    function readIdentifierOrKeywordToken(sourceCode, currentIndex, line, column) {
        let index = currentIndex;
        let currentToken = sourceCode[index];
        let newIndex = index + 1;
        while (/^[a-z]+$/.test(sourceCode[newIndex]) && newIndex < sourceCode.length) {
            currentToken += sourceCode[newIndex];
            newIndex++;
        }
        const tokenType = isKeyword(currentToken) ? TokenType.KEYWORD : TokenType.ID;
        return {
            token: { char: currentToken, type: tokenType, position: { line, column } },
            newIndex: newIndex - 1
        };
    }
    // Function to check if a token is a keyword
    function isKeyword(token) {
        return keywords.includes(token);
    }
    // Define the list of keywords
    const keywords = ["print", "while", "if", "int", "string", "boolean", "True", "False"];
    for (let i = 0; i < sourceCode.length; i++) {
        let currentChar = sourceCode[i];
        // Inside string literal
        if (insideString) {
            if (currentChar === '"') {
                insideString = false;
                for (let j = 0; j < currentStringLiteral.length; j++) {
                    programs[currentProgramIndex].push({ char: currentStringLiteral[j], type: TokenType.STRING, position: { line, column } });
                    column++;
                }
                currentStringLiteral = "";
            }
            else {
                if (/^[a-z]$/.test(currentChar)) {
                    currentStringLiteral += currentChar;
                }
                else {
                    programs[currentProgramIndex].push(createErrorToken(currentChar, line, column, "Invalid character"));
                }
            }
            continue;
        }
        // Check for opening and closing string literal
        if (currentChar === '"') {
            insideString = true;
            continue;
        }
        // Check for comments
        if (!insideComment && currentChar === '/' && sourceCode[i + 1] === '*') {
            insideComment = true;
            i++; // Skip the asterisk
            continue;
        }
        if (insideComment && currentChar === '*' && sourceCode[i + 1] === '/') {
            insideComment = false;
            i++; // Skip the closing slash
            continue;
        }
        // Skip characters inside comments
        if (insideComment) {
            continue;
        }
        // Check for opening and closing block
        if (currentChar === '{') {
            programs[currentProgramIndex].push({ char: currentChar, type: TokenType.OPENING_BLOCK, position: { line, column } });
            openSymbolsStack.push('{');
            continue;
        }
        if (currentChar === '}') {
            programs[currentProgramIndex].push({ char: currentChar, type: TokenType.CLOSING_BLOCK, position: { line, column } });
            if (openSymbolsStack.length > 0 && openSymbolsStack[openSymbolsStack.length - 1] === '{') {
                openSymbolsStack.pop();
            }
            else {
                // No matching opening symbol found
                programs[currentProgramIndex].push({ char: currentChar, type: TokenType.PUNCTUATION, position: { line, column }, warning: 'Unexpected closing symbol' });
            }
            continue;
        }
        // Check for parentheses
        if (currentChar === '(' || currentChar === ')') {
            programs[currentProgramIndex].push({ char: currentChar, type: TokenType.PUNCTUATION, position: { line, column } });
            continue;
        }
        // Check for data types
        const dataTypes = {
            'int': TokenType.DTYPE,
            'string': TokenType.DTYPE,
            'boolean': TokenType.DTYPE
        };
        if (currentChar in dataTypes) {
            const tokenType = dataTypes[currentChar];
            programs[currentProgramIndex].push({ char: currentChar, type: tokenType, position: { line, column } });
            continue;
        }
        // Check for boolean operators
        const boolOps = {
            '==': TokenType.BOOLVAL,
            '!=': TokenType.BOOLVAL
        };
        if (currentChar === '=' && sourceCode[i + 1] === '=') {
            const tokenType = TokenType.BOOLVAL;
            programs[currentProgramIndex].push({ char: '==', type: tokenType, position: { line, column } });
            i++; // Skip the next character
            continue;
        }
        if (currentChar === '!' && sourceCode[i + 1] === '=') {
            const tokenType = TokenType.BOOLVAL;
            programs[currentProgramIndex].push({ char: '!=', type: tokenType, position: { line, column } });
            i++; // Skip the next character
            continue;
        }
        // Check for boolean values
        const boolValues = {
            'True': TokenType.BOOLVAL,
            'False': TokenType.BOOLVAL
        };
        if (currentChar in boolValues) {
            const tokenType = boolValues[currentChar];
            programs[currentProgramIndex].push({ char: currentChar, type: tokenType, position: { line, column } });
            continue;
        }
        // Check for addition sign
        if (currentChar === '+') {
            programs[currentProgramIndex].push({ char: currentChar, type: TokenType.INTOP, position: { line, column } });
            continue;
        }
        // Check for keywords
        const keywords = {
            'print': TokenType.PrintState,
            'while': TokenType.WhileState,
            'if': TokenType.IfState
        };
        if (currentChar in keywords) {
            const tokenType = keywords[currentChar];
            programs[currentProgramIndex].push({ char: currentChar, type: tokenType, position: { line, column } });
            continue;
        }
        // Check for assignment
        if (currentChar === '=') {
            programs[currentProgramIndex].push({ char: currentChar, type: TokenType.Assigment, position: { line, column } });
            continue;
        }
        // Check for EOP
        if (currentChar === '$') {
            programs[currentProgramIndex].push({ char: currentChar, type: TokenType.EoP, position: { line, column } });
            currentProgramIndex++;
            programs[currentProgramIndex] = [];
            line++;
            column = 1;
            continue;
        }
        // Check for numbers
        if (/^[0-9]+$/.test(currentChar)) {
            const { token, newIndex } = readNumberToken(sourceCode, i, line, column);
            programs[currentProgramIndex].push(token);
            i = newIndex;
            continue;
        }
        // Check for identifiers or keywords
        if (/^[a-z]+$/.test(currentChar)) {
            const { token, newIndex } = readIdentifierOrKeywordToken(sourceCode, i, line, column);
            programs[currentProgramIndex].push(token);
            i = newIndex;
            continue;
        }
        // Increment line and column numbers
        if (currentChar === "\n") {
            line++;
            column = 1;
        }
        else {
            column++;
        }
        // Check for invalid characters
        if (/[^a-zA-Z0-9\s"';{}=!$()]/.test(currentChar)) {
            programs[currentProgramIndex].push(createErrorToken(currentChar, line, column, "Invalid character"));
        }
    }
    // Check for unclosed symbols at the end of the program
    openSymbolsStack.forEach(symbol => {
        const warningMessage = `Unclosed ${symbol}`;
        programs[currentProgramIndex].push({
            char: "",
            type: TokenType.PUNCTUATION,
            position: { line, column },
            warning: warningMessage
        });
    });
    if (!eopFound) {
        // Push a warning token to indicate missing EOP
        programs[currentProgramIndex].push({
            char: "",
            type: TokenType.PUNCTUATION,
            position: { line, column },
            warning: "No end-of-program sign ('$') found"
        });
    }
    if (insideComment) {
        programs[currentProgramIndex].push({
            char: "",
            type: TokenType.PUNCTUATION,
            position: { line, column },
            warning: "Unclosed comment at the end of the source code"
        });
    }
    return programs;
}
// Function to skip whitespace characters
function skipWhitespace(input, currentIndex) {
    let index = currentIndex;
    while (index < input.length && /\s/.test(input[index])) {
        if (input[index] === '"') {
            const nextQuoteIndex = input.indexOf('"', index + 1);
            if (nextQuoteIndex !== -1) {
                index = nextQuoteIndex + 1;
            }
            else {
                return index;
            }
        }
        else {
            index++;
        }
    }
    return index;
}
// Function to create an error token
function createErrorToken(char, line, column, errorMessage) {
    return {
        char,
        type: TokenType.PUNCTUATION,
        position: { line, column },
        error: `Invalid character "${char}" (${errorMessage})`
    };
}
// Function to read a number token
function readNumberToken(sourceCode, currentIndex, line, column) {
    let index = currentIndex;
    let currentNumber = sourceCode[index];
    let newIndex = index + 1;
    while (/^[0-9]+$/.test(sourceCode[newIndex]) && newIndex < sourceCode.length) {
        currentNumber += sourceCode[newIndex];
        newIndex++;
    }
    return {
        token: { char: currentNumber, type: TokenType.NUMBER, position: { line, column } },
        newIndex: newIndex - 1
    };
}
// Function to read an identifier or keyword token
function readIdentifierOrKeywordToken(sourceCode, currentIndex, line, column) {
    let index = currentIndex;
    let currentToken = sourceCode[index];
    let newIndex = index + 1;
    while (/^[a-z]+$/.test(sourceCode[newIndex]) && newIndex < sourceCode.length) {
        currentToken += sourceCode[newIndex];
        newIndex++;
    }
    const tokenType = isKeyword(currentToken) ? TokenType.KEYWORD : TokenType.ID;
    return {
        token: { char: currentToken, type: tokenType, position: { line, column } },
        newIndex: newIndex - 1
    };
}
// Function to check if a token is a keyword
function isKeyword(token) {
    return keywords.includes(token);
}
// Define the list of keywords
const keywords = ["print", "while", "if", "int", "string", "boolean", "true", "false"];
//# sourceMappingURL=Lexer.js.map