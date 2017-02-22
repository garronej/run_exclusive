import { execStack } from "../lib/index";
require("colors");

class MyClass{

    constructor(){};

    public alphabet= "";


    public myMethod= execStack("GROUP", (char: string, wait: number, callback?: (alphabet: string)=> void): void => {

        setTimeout(()=> {
            this.alphabet+= char;
            callback!(this.alphabet);
        }, wait);

    });


}


let start= Date.now();

let inst1= new MyClass();

inst1.myMethod("a", 1000, alphabet=> console.log(alphabet));
inst1.myMethod("b", 1000, alphabet=> console.log(alphabet));

let inst2= new MyClass();

let rev= [ "n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b" ];
let wait= 500;

for( let char of rev)
    inst2.myMethod(char, wait, alphabet => console.log(alphabet.blue));
inst2.myMethod("a", wait, function() {

    let end= Date.now() - start;

    //cSpell: disable
    console.assert(this.alphabet === "nmlkjihgfedcba" );
    //cSpell: enable

    let expectedDuration= (rev.length+1)*500;

    console.assert( end > expectedDuration && end < expectedDuration + 300 );

    console.log("PASS".green);


});

inst1.myMethod("c", 1000, alphabet=> console.log(alphabet));
inst1.myMethod("d", 1000, ()=>{

    let end= Date.now() - start;

    //cSpell: disable
    console.assert(inst1.alphabet === "abcd" );
    //cSpell: enable

    let expectedDuration= 1000*4;

    console.assert( end > expectedDuration && end < expectedDuration + 300 );

});