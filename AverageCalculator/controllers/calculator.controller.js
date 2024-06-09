import axios from "axios";

let window = [];
let uniqueNumbers = new Set();

const fetchFromServer = async (qualifiedId) => {
  const endpointMap = {
    p: "primes",
    f: "fibo",
    e: "even",
    r: "rand",
  };

  try {
    const response = await axios.get(
      `${process.env.TEST_SERVER_URL}/${endpointMap[qualifiedId]}`,
      {
        timeout: parseInt(process.env.TIMEOUT),
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      }
    );

    return response.data.numbers;
  } catch (error) {
    return null;
  }
};

const addNumber = (number) => {
  if (!uniqueNumbers.has(number)) {
    if (window.length === parseInt(process.env.WINDOW_SIZE)) {
      const oldestNumber = window.shift();
      uniqueNumbers.delete(oldestNumber);
    }
    window.push(number);
    uniqueNumbers.add(number);
  }
};

const calculateAverage = () => {
  const sum = window.reduce((acc, num) => acc + num, 0);
  return window.length ? sum / window.length : 0;
};

const calculatorController = async (req, res) => {
  const numberId = req.params.numberId;

  if (!["p", "f", "e", "r"].includes(numberId)) {
    return res.status(400).json({ error: "Invalid number ID" });
  }

  let timeoutHandler;
  const timeout = process.env.TIMEOUT;

  const timeoutPromise = new Promise((resolve) => {
    timeoutHandler = setTimeout(() => {
      resolve({ error: "Response delayed due to internal server error", status: 500 });
    }, timeout);
  });

  const processPromise = (async () => {
    const numbers = await fetchFromServer(numberId);
    if (numbers !== null && numbers.length > 0) {
      const previousState = [...window];
      numbers.forEach(addNumber);
      
      const currentState = [...window];
      const average = calculateAverage();

      const response = {
        numbers: number,
        windowPrevState: previousState,
        windowCurrState: currentState,
        avg: average,
      };

      return { response, status: 200 };
    } else {
      return { error: "Failed to fetch number from test server", status: 500 };
    }
  })();

  const result = await Promise.race([processPromise, timeoutPromise]);
  
  clearTimeout(timeoutHandler);

  if (result.status === 200) {
    res.json(result.response);
  } else {
    res.status(result.status).json({ error: result.error });
  }
};

export { calculatorController };
