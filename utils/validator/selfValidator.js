const phoneValidator = (phoneNumber) => {
    let number = phoneNumber.toString();
    for (let i=0; i<number.length; i++){
        if (number[i]<'0' || number[i]>'9') return false;
    }
    return (number.length === 10 && number[0] === '0' && number[1] === '9');
}

module.exports = phoneValidator;