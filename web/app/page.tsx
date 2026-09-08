"use client";

import Link from "next/link";
import styled from "styled-components";
import { MOCK_EPISODES } from "./mockData";

const Grid = styled.div`
  display: flex;
  gap: 24px;
  padding: 48px;
  flex-wrap: wrap;
`;

const Card = styled(Link)`
  display: block;
  width: 260px;
  padding: 20px;
  border-radius: 8px;
  background: #1a1a22;
  color: #fff;
  text-decoration: none;
  border: 1px solid #2a2a35;
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.03);
    border-color: #5a5aff;
  }
`;

const Title = styled.h2`
  font-size: 18px;
  margin: 0 0 8px 0;
`;

const Synopsis = styled.p`
  font-size: 14px;
  color: #aaa;
  margin: 0;
`;

const Heading = styled.h1`
  padding: 48px 48px 0;
  font-size: 28px;
`;

export default function HomePage() {
  return (
    <>
      <Heading>Featured Shows</Heading>
      <Grid>
        {MOCK_EPISODES.map((ep) => (
          <Card key={ep.id} href={`/watch/${ep.id}`}>
            <Title>{ep.title}</Title>
            <Synopsis>{ep.synopsis}</Synopsis>
          </Card>
        ))}
      </Grid>
    </>
  );
}
