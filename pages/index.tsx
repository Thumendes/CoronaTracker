import Head from "next/head";
import style from "../styles/Home.module.scss";
import { GetServerSideProps } from "next";
import axios from "axios";
import { useState, useRef } from "react";
import { Line } from "react-chartjs-2";

export default function Home({ data, countries, daily }) {
  const [searchData, setSearchData] = useState(null);
  const countryRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { data: search } = await axios.get(
      `https://covid19.mathdro.id/api/countries/${countryRef.current.value}/confirmed`
    );

    setSearchData(search);
  };
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="favicon.png" type="image/x-icon" />
        <title>Corona Vírus</title>
      </Head>
      <div className={style.container}>
        <header>
          <h1 className={style.title}>Corona Vírus Mundial</h1>
        </header>
        <aside className={style.cards}>
          <div className={`${style.card} ${style.recovered}`}>
            <div className={style.info}>
              <h1>{data.recovered.value}</h1>
              <span>casos recuperados</span>
            </div>
          </div>
          <div className={style.card}>
            <div className={style.info}>
              <h1>{data.confirmed.value}</h1>
              <span>casos confirmados</span>
            </div>
          </div>
          <div className={style.card}>
            <div className={style.info}>
              <h1>{data.deaths.value}</h1>
              <span>casos de falecimento</span>
            </div>
          </div>
        </aside>
        <main>
          <div className={`${style.card} ${style.nospace}`}>
            <form onSubmit={handleSubmit}>
              <h3>Procure algum lugar para obter informações</h3>
              <div>
                {countries && (
                  <select ref={countryRef}>
                    {countries.map((country, index) => (
                      <option key={index} value={country.iso3}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                )}
                <button type="submit">Pesquisar</button>
              </div>
            </form>
            <table cellPadding={0} cellSpacing={0}>
              <thead>
                <tr>
                  <td>Estado</td>
                  <td>Confirmados</td>
                  <td>Mortes</td>
                  <td>Recuperados</td>
                  <td>Mortal./Confir.</td>
                  <td>Atualização</td>
                </tr>
              </thead>
              <tbody>
                {searchData &&
                  searchData.map((dado) => {
                    const date = new Date(dado.lastUpdate);
                    const dateParsed = `${date.getDate()}/${date.getMonth()} ${date.getHours()}:${date.getMinutes()}`;
                    const ratioConfirmedDeath = Math.floor(
                      dado.confirmed / dado.deaths
                    );
                    return (
                      <tr>
                        <td>
                          <b>{dado.provinceState || dado.countryRegion}</b>
                        </td>
                        <td>{dado.confirmed}</td>
                        <td>{dado.recovered}</td>
                        <td>{dado.deaths}</td>
                        <td>{ratioConfirmedDeath}%</td>
                        <td>{dateParsed}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </main>

        <section className={style.card}>
          <div className={style.chart}>
            <h1>Confirmados</h1>
            <Line
              data={{
                labels: daily.map((day) => day.reportDate),
                datasets: [
                  {
                    backgroundColor: "#00f2",
                    borderColor: "#00f",
                    label: "Confirmado",
                    data: daily.map((day) => day.confirmed.total),
                  },
                ],
              }}
            />
          </div>
          <div className={style.chart}>
            <h1>Óbitos</h1>
            <Line
              data={{
                labels: daily.map((day) => day.reportDate),
                datasets: [
                  {
                    backgroundColor: "#0f02",
                    borderColor: "#0f0",
                    label: "Mortes",
                    data: daily.map((day) => day.deaths.total),
                  },
                ],
              }}
            />
          </div>
        </section>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { data } = await axios.get("https://covid19.mathdro.id/api");
  const { data: daily } = await axios.get(
    "https://covid19.mathdro.id/api/daily"
  );
  const { data: countries } = await axios.get(
    "https://covid19.mathdro.id/api/countries"
  );
  return {
    props: { data, countries: countries.countries, daily },
  };
};
