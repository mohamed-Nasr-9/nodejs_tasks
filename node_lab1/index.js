const [, , action, ...numbers] = process.argv;
console.log("🚀 ~ params:", action, numbers);

function add(numbers) {
    return numbers.reduce((acc, val) => {
        return acc + parseInt(val);
    }, 0);
}

function divide(numbers) {
    if (parseInt(numbers[1]) !== 0) {
        return parseInt(numbers[0]) / parseInt(numbers[1]);
    }
    console.error("the second number can't be zero");
}
// subtract
function sub(numbers) {
    if (numbers.length < 2) {
        console.error("to subtract enter 2 numbers");
        return;
    }
    return numbers.reduce((acc, val) => {
        return acc - parseInt(val);
    });
}
// multiply
function by(numbers) {
    if (numbers.length < 2) {
        console.error("to multiply enter 2 numbers");
        return;
    }
    return numbers.reduce((acc, val) => {
        return acc * parseInt(val);
    }, 1);
}

let result;
switch (action) {
    case "add":
        result = add(numbers);
        break;
    case "divide":
        result = divide(numbers);
        break;
    case "sub":
        result = sub(numbers);
        break;
    case "by":
        result = by(numbers);
        break;
    default:
        console.log("unknown action");
        break;
}

if (result !== undefined) {
  console.log("result is:", result);
}