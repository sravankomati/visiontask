const validator = require("validator");
const paymentSchema = require("../model/paymentSchema");
const ApiContracts = require("authorizenet").APIContracts;
const ApiControllers = require("authorizenet").APIControllers;

function validateForm(req) {
  const { cc, cvv, expire, amount } = req.body;

  const errors = [];

  if (!validator.isCreditCard(cc)) {
    errors.push({
      param: "cc",
      msg: "Invalid credit card number.",
    });
  }

  if (!/^\d{3}$/.test(cvv)) {
    errors.push({
      param: "cvv",
      msg: "Invalid CVV code.",
    });
  }

  if (!/^\d{4}$/.test(expire)) {
    errors.push({
      param: "expire",
      msg: "Invalid expiration date.",
    });
  }

  if (!validator.isDecimal(amount)) {
    errors.push({
      param: "amount",
      msg: "Invalid amount.",
    });
  }

  return errors;
}

module.exports = {
  authorizePay(req,res) {
    const validationErrors = validateForm(req);

    if (validationErrors.length > 0) {
      res.json({ errors: validationErrors });
      return;
    }

    const { cc, cvv, expire, amount } = req.body;

    const merchantAuthenticationType =
      new ApiContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName("2Z6879nZrUD");
    merchantAuthenticationType.setTransactionKey("7fU2y5S8se4k4Bzq");

    const creditCard = new ApiContracts.CreditCardType();
    creditCard.setCardNumber(cc);
    creditCard.setExpirationDate(expire);
    creditCard.setCardCode(cvv);

    const paymentType = new ApiContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    const transactionSetting = new ApiContracts.SettingType();
    transactionSetting.setSettingName("recurringBilling");
    transactionSetting.setSettingValue("false");

    const transactionSettingList = [];
    transactionSettingList.push(transactionSetting);

    const transactionSettings = new ApiContracts.ArrayOfSetting();
    transactionSettings.setSetting(transactionSettingList);

    const transactionRequestType = new ApiContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(
      ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
    );
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setAmount(amount);
    transactionRequestType.setTransactionSettings(transactionSettings);

    const createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    const ctrl = new ApiControllers.CreateTransactionController(
      createRequest.getJSON()
    );

    ctrl.execute(async () => {
      const apiResponse = ctrl.getResponse();
      const response = new ApiContracts.CreateTransactionResponse(apiResponse);

      if (response !== null) {
        if (
          response.getMessages().getResultCode() ===
          ApiContracts.MessageTypeEnum.OK
        ) {
          if (response.getTransactionResponse().getMessages() !== null) {
            console.log(apiResponse);
            await paymentSchema.create({
              username: req.body.username,
              currency: "USD",
              amount: req.body.amount,
              payment_id: apiResponse.transactionResponse.transId,
              paymentMethod: ".net",
            });
            res.redirect("/list");
          } else {
            if (response.getTransactionResponse().getErrors() !== null) {
              let code = response
                .getTransactionResponse()
                .getErrors()
                .getError()[0]
                .getErrorCode();
              let text = response
                .getTransactionResponse()
                .getErrors()
                .getError()[0]
                .getErrorText();
              res.json({
                error: `${code}: ${text}`,
              });
            } else {
              res.json({ error: "Transaction failed." });
            }
          }
        } else {
          if (
            response.getTransactionResponse() !== null &&
            response.getTransactionResponse().getErrors() !== null
          ) {
            let code = response
              .getTransactionResponse()
              .getErrors()
              .getError()[0]
              .getErrorCode();
            let text = response
              .getTransactionResponse()
              .getErrors()
              .getError()[0]
              .getErrorText();
            res.json({
              error: `${code}: ${text}`,
            });
          } else {
            let code = response.getMessages().getMessage()[0].getCode();
            let text = response.getMessages().getMessage()[0].getText();
            res.json({
              error: `${code}: ${text}`,
            });
          }
        }
      } else {
        res.json({ error: "No response." });
      }
    });
  },
};
