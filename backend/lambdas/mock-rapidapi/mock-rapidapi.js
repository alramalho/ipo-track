exports.handler = async (event) => {

    return {
      'statusCode': 200,
      'body': JSON.stringify({
        "count": 1,
        "data": [
          {
            "symbol": "TESTE",
            "symbolSpacUnit": "TestETE",
            "name": "Teste Acme Corp. I",
            "exchange": "NASDAQ",
            "ipoDate": "2021-02-28",
            "ipoPriceLow": 7,
            "ipoPriceHigh": 7,
            "ipoPriceFinal": 7,
            "sharesOffered": 2000000,
            "sharesOutstanding": 25000000,
            "sector": "Blank Check / SPAC",
            "industry": "Blank Check / SPAC",
            "marketCap": 250000000
          }
        ]
      })
    }
}