import { useEffect, useRef } from "react";
import { useState } from "react";

type StateMachine<Type> = {
  isLoading: boolean;
  idle: boolean;
  response: {
    data: Type;
  } | null;
  error: {
    message: string;
    statusCode: number;
    error: string;
  } | null;
};

type Return<Type> = StateMachine<Type> & {
  refetch: (cache: boolean) => void;
  abort: () => void;
};

const MAX_RETRIES = 3;
const CACHE_TTL = 600000; //in ms
const RETRY_INTERVAL = 2000;

const useQuery = <Type>(
  url: string,
  requestInfo?: RequestInit
): Return<Type> => {
  const [state, setState] = useState<StateMachine<Type>>({
    isLoading: true,
    idle: true,
    response: null,
    error: null,
  });
  const queryUrl = url;
  const retriesNumber = useRef(0);
  const setResponseData = (res: Type) =>
    setState((prev) => ({
      ...prev,
      idle: false,
      isLoading: false,
      response: { data: res },
      error: null,
    }));
  const setErrorData = (error: Return<Type>["error"]) =>
    setState((prev) => ({
      ...prev,
      idle: false,
      isLoading: false,
      response: null,
      error: error,
    }));
  const abortController = useRef(new AbortController());
  const withCache = useRef(true);

  const abort = () => abortController.current.abort();
  const refetch: Return<Type>["refetch"] = (cache = true) => {
    withCache.current = cache;
    setState((prev) => ({ ...prev, idle: true }));
  };

  useEffect(() => {
    if (!state.isLoading) refetch(true);
  }, [url]);

  const doFetch = async () => {
    const cacheRead = await caches.open("useQuery");
    const found = await cacheRead.match(url);
    const dateHeader: string | null | undefined =
      found?.headers.get("query-date");
    const parseDateHeader: Date = new Date(dateHeader || 0);
    if (
      found &&
      dateHeader &&
      Number(Date.now()) - Number(parseDateHeader) < CACHE_TTL &&
      withCache.current
    ) {
      setResponseData(await found.json());
    } else {
      abortController.current = new AbortController();
      await fetch(queryUrl, {
        ...requestInfo,
        signal: abortController.current.signal,
      })
        .then(async (res) => {
          if (res.ok) {
            const clone = res.clone();
            const cache = await caches.open("useQuery");
            const headers = new Headers(clone.headers);
            headers.append("query-date", new Date().toUTCString());

            await cache.put(
              url,
              new Response(clone.body, { ...clone, headers })
            );
          }

          return await res.json();
        })
        .then((res) => {
          if (res.error) {
            return Promise.reject(res);
          } else {
            setResponseData(res);
          }
          retriesNumber.current = 0;
        })
        .catch(async (err) => {
          if (abortController.current.signal.aborted)
            return setErrorData({
              error: "Aborted by the user",
              message: "Aborted by the user",
              statusCode: -1,
            });

          if (retriesNumber.current < MAX_RETRIES - 1) {
            retriesNumber.current++;
            await new Promise(async (res) => {
              const id = setTimeout(async () => {
                const response = await doFetch();
                clearTimeout(id);
                res(response);
              }, RETRY_INTERVAL);
            });
          } else {
            setErrorData(err);
          }
        })
        .finally(() => {
          withCache.current = true;
        });
    }
  };

  if (state.idle) {
    setState((prev) => ({ ...prev, isLoading: true, idle: false }));
    doFetch();
  }
  return { ...state, refetch, abort };
};

export default useQuery;
