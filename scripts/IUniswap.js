const { ethers } = require("hardhat");
const { parseEther, parseUnits } = require("ethers");

const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const USDCHolder = "0x51eDF02152EBfb338e03E30d65C15fBf06cc9ECC";

    await helpers.impersonateAccount(USDCHolder);
    const impersonatedSigner = await ethers.getSigner(USDCHolder);

    const USDC = await ethers.getContractAt("IERC20", USDCAddress);
    const DAI = await ethers.getContractAt("IERC20", DAIAddress);
    const WETH = await ethers.getContractAt("IERC20", wethAddress);

    const ROUTER = await ethers.getContractAt("IUniswap", UNIRouter);

    const approveUSDCTx = await USDC.connect(impersonatedSigner).approve(UNIRouter, parseUnits("220", 18));
    approveUSDCTx.wait()

    const approveDAITx = await DAI.connect(impersonatedSigner).approve(UNIRouter, parseUnits("200", 18));
    approveDAITx.wait()

    const ethBal = await impersonatedSigner.provider.getBalance(USDCHolder);
    const userWethBal = await WETH.balanceOf(impersonatedSigner.address);

    const usdcBal = await USDC.balanceOf(impersonatedSigner.address);

    console.log("WETH Balance:", ethers.formatUnits(userWethBal, 18));
    console.log("ETH Balance:",ethers.formatUnits(ethBal, 18));
    console.log("USDC Balance:", ethers.formatUnits(usdcBal, 6))

    console.log("-------------------------------Adding liquidity----------------------------------")

    const liquidityTx = await ROUTER.connect(impersonatedSigner)
        .addLiquidityETH(USDCAddress, parseUnits("20", 6), parseUnits("10", 6),
        parseEther("10"), USDCHolder, (Date.now() + (60*15)),
        {value: parseEther("20")});
    liquidityTx.wait()

    console.log("WETH Balance after adding liquidity:", ethers.formatUnits(await WETH.balanceOf(USDCHolder), 18));
    console.log("ETH Balance after adding liquidity:", ethers.formatUnits(await impersonatedSigner.provider.getBalance(USDCHolder), 18));
    console.log("USDC Balance after adding liquidity:", ethers.formatUnits(await USDC.balanceOf(USDCHolder), 6));

    // Get liquidity tokens balance before removing liquidity
    const liquidityTokenBalanceBefore = await ROUTER.balanceOf(USDCHolder);
    console.log('Liquidity Token Balance Before:', liquidityTokenBalanceBefore.toString());

    // Remove liquidity
    const amountLiquidityToRemove = ethers.utils.parseUnits("10", 18); // Example: remove 10 liquidity tokens
    const minAmountTokenA = ethers.utils.parseUnits("0", 18); // Minimum amount of token A to receive
    const minAmountTokenB = ethers.utils.parseUnits("0", 18); // Minimum amount of token B to receive
    const deadline = Math.floor(Date.now() / 1000) + 60 * 15; // 15 minutes from now
    const removeLiquidityTx = await ROUTER.connect(impersonatedSigner).removeLiquidity(
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC address
        "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI address
        amountLiquidityToRemove,
        minAmountTokenA,
        minAmountTokenB,
        USDCHolder,
        deadline
    );
    await removeLiquidityTx.wait();

    // Get liquidity tokens balance after removing liquidity
    const liquidityTokenBalanceAfter = await ROUTER.balanceOf(USDCHolder);
    console.log('Liquidity Token Balance After:', liquidityTokenBalanceAfter.toString());
}


main().catch((error) => {
    console.error(error);
    process.exit(1)
})
