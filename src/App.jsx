import React, { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import FotoList from "./components/FotoList";
import FotoAmpliada from "./components/FotoAmpliada";
import "./index.css";

import axios from "axios";

const App = () => {
  const [fotos, setFotos] = useState([]);
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fotoAmpliada, setFotoAmpliada] = useState(null);
  const [activateSearch, setActivateSearch] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const fetchData = async ({ query, categoria }) => {
    const apiKey = import.meta.env.VITE_UNSPLASH_API_KEY;

    setCarregando(true);
    setErro(null);

    if (!apiKey) {
      setErro(
        "Chave da API não configurada. Defina VITE_UNSPLASH_API_KEY no arquivo .env."
      );
      setCarregando(false);
      return;
    }

    // Se tiver query e/ou categoria, busca pelas duas
    if (query || categoria) {
      let searchQuery = query;

      // Combina query com categoria se ambas existirem
      if (query && categoria) {
        searchQuery = `${query} ${categoria}`;
      } else if (categoria) {
        searchQuery = categoria;
      }

      try {
        const response = await axios.get(
          `https://api.unsplash.com/search/photos`,
          {
            params: {
              query: searchQuery,
              client_id: apiKey,
            },
          }
        );
        setFotos(response.data?.results ?? []);
      } catch (error) {
        console.error("Ocorreu um erro ao buscar as fotos: ", error);
        setFotos([]);
        setErro(
          error.response?.status === 403
            ? "Limite de requisições da API do Unsplash atingido. Tente novamente mais tarde."
            : "Não foi possível buscar as fotos agora. Tente novamente."
        );
      } finally {
        setCarregando(false);
      }
      return;
    }

    // Se não tiver nem query nem categoria, busca fotos aleatórias
    try {
      const response = await axios.get(
        `https://api.unsplash.com/photos/random`,
        {
          params: {
            client_id: apiKey,
            count: 10,
          },
        }
      );
      setFotos(response.data ?? []);
    } catch (error) {
      console.error("Ocorreu um erro ao buscar as fotos aleatórias: ", error);
      setFotos([]);
      setErro(
        error.response?.status === 403
          ? "Limite de requisições da API do Unsplash atingido. Tente novamente mais tarde."
          : "Não foi possível carregar as fotos agora. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    fetchData({ query, categoria });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activateSearch) {
      fetchData({ query, categoria });
      setActivateSearch(false); // Reset após a busca
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activateSearch]);

  return (
    <div className="container">
      <SearchBar
        setQuery={setQuery}
        setCategoria={setCategoria}
        setActivateSearch={setActivateSearch}
      />
      {carregando && <p>Carregando fotos...</p>}
      {!carregando && erro && <p role="alert">{erro}</p>}
      {!carregando && !erro && fotos.length === 0 && (
        <p>Nenhuma foto encontrada. Tente outra busca.</p>
      )}
      {!carregando && !erro && fotos.length > 0 && (
        <FotoList fotos={fotos} setFotoAmpliada={setFotoAmpliada} />
      )}
      {fotoAmpliada && (
        <FotoAmpliada foto={fotoAmpliada} setFotoAmpliada={setFotoAmpliada} />
      )}
    </div>
  );
};

export default App;
