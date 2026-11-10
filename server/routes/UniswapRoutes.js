const express = require("express");
const router = express.Router();

const { getSwapData } = require("../controllers/SwapController");
const { getQuote } = require("../controllers/SwapController");
const { checkApproval } = require("../controllers/ApprovalController");
const{getTransactions}=require("../controllers/TransactionHistoryController");
const {getTokenBalances}=require("../controllers/TokenBalances");
const {getAllNFTs}=require("../controllers/NFTsController");
const{getTransactionsDetails}=require("../controllers/TransactionDetailsController");

router.post("/quote", getQuote);
router.post("/swap", getSwapData);
router.post("/check-approval", checkApproval);
router.post("/tx-history",getTransactions);
router.post("/tx-history-details",getTransactionsDetails);
router.post("/token-balances", getTokenBalances);
router.post("/nfts", getAllNFTs);

module.exports = router;