import { execStack } from "../lib/index";
require("colors");

class MyClass{

    constructor(){};

    public alphabet= "";


    public myMethod1= execStack("GROUP", (char: string, wait: number, callback?: (alphabet: string)=> void): void => {

        let safeCallback= callback || function(){};

        setTimeout(()=> {
            this.alphabet+= char;
            safeCallback(this.alphabet);
        }, wait);

    });

    public alphabet2= "";

    public myMethod2= execStack((char: string, wait: number, callback?: (alphabet: string)=> void): void => {

        let safeCallback= callback || function(){};

        setTimeout(()=> {
            this.alphabet2+= char;
            safeCallback(this.alphabet2);
        }, wait);

    });




}


let start= Date.now();

let inst= new MyClass();

inst.myMethod1("a", 1000, alphabet=> console.log(alphabet));
inst.myMethod1("b", 1000, alphabet=> console.log(alphabet));


let rev= [ "n", "m", "l", "k", "j", "i", "h", "g", "f", "e", "d", "c", "b" ];
let wait= 500;

for( let char of rev)
    inst.myMethod2(char, wait, alphabet => console.log(alphabet.blue));
inst.myMethod2("a", wait, function() {

    let end= Date.now() - start;

    //cSpell: disable
    console.assert(this.alphabet2 === "nmlkjihgfedcba" );
    //cSpell: enable

    let expectedDuration= (rev.length+1)*500;

    console.assert( end > expectedDuration && end < expectedDuration + 300 );

    console.log("PASS".green);


});

inst.myMethod1("c", 1000, alphabet=> console.log(alphabet));
inst.myMethod1("d", 1000, ()=>{

    let end= Date.now() - start;

    //cSpell: disable
    console.assert(inst.alphabet === "abcd" );
    //cSpell: enable

    let expectedDuration= 1000*4;

    console.assert( end > expectedDuration && end < expectedDuration + 300 );

});