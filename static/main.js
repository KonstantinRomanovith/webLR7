function priority(operation) {
    if (operation == '+' || operation == '-') {
        return 1;
    } else {
        return 2;
    }
}

function isNumeric(str) {
    return /^\d+(\.\d+)?$/.test(str);
}

function isDigit(str) {
    return /^\d{1}$/.test(str);
}

function isOperation(str) {
    return /^[\+\-\*\/]{1}$/.test(str);
}

function tokenize(str) {
    let tokens = [];
    let lastNumber = '';

    for (let char of str) {
        if (isDigit(char) || char == '.') {
            lastNumber += char;
        } else {
            if (lastNumber.length > 0) {
                tokens.push(lastNumber);
                lastNumber = '';
            }
            if (isOperation(char) || char == '(' || char == ')') {
                tokens.push(char);
            }
        }
    }

    if (lastNumber.length > 0) {
        tokens.push(lastNumber);
    }

    return tokens;
}

function compile(str) {
    let out = [];
    let stack = [];

    for (let token of tokenize(str)) {
        if (isNumeric(token)) {
            out.push(token);
        } else if (isOperation(token)) {
            while (stack.length > 0 &&
                isOperation(stack[stack.length - 1]) &&
                priority(stack[stack.length - 1]) >= priority(token)) {
                out.push(stack.pop());
            }
            stack.push(token);
        } else if (token == '(') {
            stack.push(token);
        } else if (token == ')') {
            while (stack.length > 0 && stack[stack.length - 1] != '(') {
                out.push(stack.pop());
            }
            stack.pop();
        }
    }

    while (stack.length > 0) {
        out.push(stack.pop());
    }

    return out.join(' ');
}

function evaluate(str) {
    let tokens = str.split(' ');
    let stack = [];

    for (let token of tokens) {
        if (isNumeric(token)) {
            stack.push(parseFloat(token));
        } else if (isOperation(token)) {
            let b = stack.pop();
            let a = stack.pop();

            switch (token) {
                case '+': stack.push(a + b); break;
                case '-': stack.push(a - b); break;
                case '*': stack.push(a * b); break;
                case '/':
                    if (b === 0) throw new Error('Деление на ноль');
                    stack.push(a / b);
                    break;
            }
        }
    }

    return stack.pop();
}

function clickHandler(event) {
    let target = event.target;
    let screen = document.querySelector('.screen span');

    if (target.classList.contains('key')) {
        screen.classList.remove('error');

        if (target.classList.contains('digit') ||
            target.classList.contains('operation') ||
            target.classList.contains('bracket')) {

            let value = target.textContent;

            if (value === '.') {
                let lastNumber = screen.textContent.split(/[\+\-\*\/\(\)]/).pop();
                if (lastNumber.includes('.')) return;
            }

            screen.textContent += value;
        }

        if (target.classList.contains('clear')) {
            screen.textContent = '';
        }

        if (target.classList.contains('result')) {
            try {
                let expression = screen.textContent.trim();
                if (expression.length === 0) return;

                let rpn = compile(expression);
                let result = evaluate(rpn);
                screen.textContent = Number(result).toFixed(2);

            } catch (error) {
                screen.textContent = 'Ошибка';
                screen.classList.add('error');
                setTimeout(() => {
                    screen.classList.remove('error');
                }, 1000);
            }
        }
    }
}

window.onload = function () {
    let buttonsContainer = document.querySelector('.buttons');
    buttonsContainer.addEventListener('click', clickHandler);
}