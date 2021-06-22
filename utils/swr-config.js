import React from "react";
import {SWRConfig} from "swr";
import axios from "axios";

export default function Config({children}) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        fetcher: url => axios.get(url).then(({data}) => data)
      }}
    >
      {children}
    </SWRConfig>
  );
}
