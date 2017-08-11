import * as runExclusive from "../lib/runExclusive";

require("colors");

interface Alphabet {
    name: "alice" | "bob";
    value: string;
}

let { spell, monitor } = (() => {

    const _fun_ = runExclusive.buildMethod(
        async (alphabet: Alphabet, letter: string): Promise<string> => {

            let lapse= (alphabet.name==="alice")?200:400;

            await new Promise<void>(resolve => setTimeout(resolve, (4 - alphabet.value.length)*lapse ));

            alphabet.value += letter;

            return alphabet.value;

        }
    );

    let spell= (async (alphabet: Alphabet, letter: string) => {

        return _fun_.call(alphabet.name, alphabet, letter);

    }) as typeof _fun_;

    let monitor= {
        getQueuedCallCount(clusterRef: string): number {
            return runExclusive.getQueuedCallCount(_fun_, clusterRef);
        },
        isRunning(clusterRef: string): boolean {
            return runExclusive.isRunning(_fun_, clusterRef);
        },
        cancelAllQueuedCalls(clusterRef: string): number {
            return runExclusive.cancelAllQueuedCalls(_fun_, clusterRef);
        }
    };

    return { spell , monitor};
    //return [ spell, monitor ];

})();

let start= Date.now();

let alphabetAlice: Alphabet= { "name": "alice", "value": "" };
let alphabetBob: Alphabet= { "name": "bob", "value": "" };

console.assert( monitor.getQueuedCallCount(alphabetAlice.name) === 0 );
console.assert( monitor.isRunning(alphabetAlice.name) === false );

spell(alphabetAlice, "A").then(value => console.log(`Alice: ${value}`));

console.assert( monitor.getQueuedCallCount(alphabetAlice.name) === 0 );
console.assert( monitor.isRunning(alphabetAlice.name) === true );


console.assert( monitor.getQueuedCallCount(alphabetBob.name) === 0 );
console.assert( monitor.isRunning(alphabetBob.name) === false );

spell(alphabetBob, "a").then(value => console.log(`Bob: ${value}`));
spell(alphabetBob, "b").then(value => console.log(`Bob: ${value}`));

spell(alphabetAlice, "B").then(value => console.log(`Alice: ${value}`));
spell(alphabetAlice, "C").then(value => console.log(`Alice: ${value}`))
.then( ()=> console.assert( monitor.cancelAllQueuedCalls(alphabetAlice.name)===1));
spell(alphabetAlice, "D").then(value => console.log(`Alice: ${value}`))
.then(()=>{

    let duration= Date.now() - start;

    console.assert(monitor.getQueuedCallCount(alphabetAlice.name) === 0);
    console.assert(monitor.isRunning(alphabetAlice.name) === false);

    //cSpell: disable
    console.assert(alphabetAlice.value === "ABCD" );
    //cSpell: enable


    let expectedDuration= (4+3+2+1)*200;

    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);

    console.assert( Math.abs(duration - expectedDuration) < 300 );
    console.assert( duration - expectedDuration >= 0 );


});
spell(alphabetAlice, "E").then(value => console.log(`Alice: ${value}`))


console.assert( monitor.getQueuedCallCount(alphabetAlice.name) === 4 );
console.assert( monitor.isRunning(alphabetAlice.name) === true );

spell(alphabetBob, "c").then(value => console.log(`Bob: ${value}`));
spell(alphabetBob, "d").then(value => console.log(`Bob: ${value}`))
.then(()=>{

    let duration= Date.now() - start;

    console.assert(monitor.getQueuedCallCount(alphabetBob.name) === 0);
    console.assert(monitor.isRunning(alphabetBob.name) === false);

    //cSpell: disable
    console.assert(alphabetBob.value === "abcd" );
    //cSpell: enable

    let expectedDuration= (4+3+2+1)*400;

    console.log("expectedDuration: ", expectedDuration);
    console.log("duration: ", duration);

    console.assert( Math.abs(duration - expectedDuration) < 300 );
    console.assert( duration - expectedDuration >= 0 );

    console.log("PASS".green);
    
});

console.assert( monitor.getQueuedCallCount(alphabetBob.name) === 3 );
console.assert( monitor.isRunning(alphabetBob.name) === true );