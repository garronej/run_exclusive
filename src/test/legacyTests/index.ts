
for (let i = 1; i <= 21; i++) {

    try {
        require("./test" + i);
    } catch (error) {

        console.log(`Fail test ${i}`);

        throw error;


    }

}