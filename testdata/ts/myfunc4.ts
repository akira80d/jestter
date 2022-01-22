type MyMap = {
    <T,U>(array:T[], f: (item:T) => U): U[]
}

const map: MyMap = (array, f) => {
    let result = []
    for (let i = 0; i < array.length; i++) {
        result[i] = f(array[i])
    }
    return result
}

console.log(map([1,2,3,4,5,6,7], _ => _*2))
console.log(map(["a","bb","ccc","dddddd"], _ => _.length))

export default map