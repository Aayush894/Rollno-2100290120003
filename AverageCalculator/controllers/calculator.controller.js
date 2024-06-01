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
  console.log(process.env.ACCESS_TOKEN)
  try {
    const response = await axios.get(
      `${process.env.TEST_SERVER_URL}/${endpointMap[qualifiedId]}`,
       { timeout: process.env.TIMEOUT,
        headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
          }
       }
    );
    
    return response.data.number;
  } catch (error) {
    return null;
  }
};

const addNumber = (number) => {
  if (!uniqueNumbers.has(number)) {
    if (window.length === process.env.WINDOW_SIZE) {
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
  const startTime = Date.now();
  const numberId = req.params.numberId;

  if (!["p", "f", "e", "r"].includes(numberId)) {
    return res.status(400).json({ error: "Invalid number ID" });
  }

  const number = await fetchFromServer(numberId);
  if (number !== null) {
    const previousState = [...window];
    addNumber(number);
    const currentState = [...window];
    const average = calculateAverage();

    const response = {
      received_number: number,
      previous_state: previousState,
      current_state: currentState,
      average: average,
    };

    const responseTime = Date.now() - startTime;
    const delay = TIMEOUT - responseTime;
    if (delay > 0) {
      setTimeout(() => res.json(response), delay);
    } else {
      res.json(response);
    }
  } else {
    res.status(500).json({ error: "Failed to fetch number from test server" });
  }
};

export { calculatorController };
