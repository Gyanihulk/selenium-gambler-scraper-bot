let test="$123"
const lastBankerBetAmount = parseFloat(
    test.replace(/[\$,]/g, "")
  );

  console.log(lastBankerBetAmount)