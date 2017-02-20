import { execStack } from "../lib/index";

require("colors");

class MyClass{

    constructor(){};

    private alphabetStack= "";

    public myMethodStack= execStack((char: string, callback?: (alphabet: string)=> void): void => {

        //Assume callback always defined
        let safeCallback= callback || function(){};

        setTimeout(()=> {
            this.alphabetStack+= char;
            safeCallback(this.alphabetStack);
        }, Math.random()*1000);

    });


}

let inst= new MyClass();

for( let char of [ "a", "b", "c", "d", "e", "f" ])
    inst.myMethodStack(char, alphabet=>console.log(`step ${alphabet}`));


for( let char of [ "g", "h", "i" ])
    inst.myMethodStack(char);

inst.myMethodStack("j", alphabet => {

    console.log(`completed ${alphabet}`);

    //cSpell: disable
    console.assert(alphabet === "abcdefghij");
    //cSpell: enable

    console.log("PASS".green);

});

