function selectTestCase(testCase) {
    
    var inputTextarea = document.getElementById("inputTextarea");

    switch (testCase) {
        case 'Heaven':
            inputTextarea.value = `
/* test case for whilestatement
 Prints 23458 */
{
 int a
 a = 1
 {
 while (a != 5) {
 a = 1 + a
 print(a)
 }
 print(3 + a)
 }
}`;
            break;
            case 'Evil':
                inputTextarea.value = `
                /* test case for whilestatement
                Prints 23458 */{inta=1{while(a!=5)
                {a=1+aprint(a)}print(3+a)}}$
                `;
                break;
                case 'please dont use me!':
                    inputTextarea.value = `
                    /* Test case for WhileStatement.
                        Prints 23458 */{intaa=1{while(a!=5)
                        {a=1+aprint(a)}print(3+a)}}$
                        `;
                    break;
        default:
            inputTextarea.value = "";
    }
}

// Add an event listener to the button
document.getElementById("executeButton").addEventListener("click", executeCode);

// Define the executeCode function
function executeCode() {
    // Read input from the input textarea
    var inputTextarea = document.getElementById("inputTextarea");
    var input = inputTextarea.value;

    // Tokenize the input using the lex function
    var tokens = lex(input);

    var parser=new Parser(tokens);

    parser.parseProgram();

    // Display the tokens in the output textarea
    var outputTextarea = document.getElementById("outputTextarea");
    outputTextarea.value = tokens;
    //outputTextarea.value=parser.getParsingMessages();
}

