import React, { useState, useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import useSWR from "swr";
import InfiniteScroll from "react-infinite-scroll-component";
import RestaurantCard from "./RestaurantCard";

interface Restaurant {
  name: string;
  urlImg: string;
  description: string;
  score: number;
  restaurantId: string;
  restaurantIndex: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const RestaurantList: React.FC = () => {
  const [items, setItems] = useState<Restaurant[]>([]);
  const [startKey, setStartKey] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchCount, setFetchCount] = useState(0);
  const fetchUrl = startKey
    ? `${process.env.REACT_APP_URL_API}/restaurant?startKey=${startKey}`
    : `${process.env.REACT_APP_URL_API}/restaurant`;
  const { data, error } = useSWR<{ items: Restaurant[]; startKey: string }>(
    isFetching ? fetchUrl : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (data) {
      const newItems = data.items.map((item, index) => ({
        ...item,
        restaurantIndex: `${item.restaurantId}-${index}-${fetchCount}`,
      }));
      setItems((prevItems) => [...prevItems, ...newItems]);
      setStartKey(data?.startKey || null);
      setIsFetching(false);
      setFetchCount(fetchCount + 1);
    }
  }, [data, items, fetchCount]);

  const fetchMoreData = () => {
    if (!isFetching) {
      setIsFetching(true);
    }
  };

  if (error) return <Typography>Error al cargar los restaurantes</Typography>;
  if (!data && items.length === 0) return <Typography>Cargando...</Typography>;

  return (
    <InfiniteScroll
      dataLength={items.length}
      next={fetchMoreData}
      hasMore={startKey ? true : false}
      loader={
        <Typography variant="h6" align="center">
          Cargando...
        </Typography>
      }
    >
      <Grid container spacing={3}>
        {items.map((restaurant) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={restaurant.restaurantIndex}
          >
            <RestaurantCard
              name={restaurant.name}
              description={restaurant.description}
              score={restaurant.score}
              image={restaurant.urlImg}
              restaurantId={restaurant.restaurantId}
            />
          </Grid>
        ))}
      </Grid>
    </InfiniteScroll>
  );
};

export default RestaurantList;
