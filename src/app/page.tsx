'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fromEvent, of } from 'rxjs';
import { debounceTime, switchMap, catchError, tap } from 'rxjs/operators';

export default function Home() {
  const [pokemon, setPokemon] = useState<string>('');
  const [pokemonData, setPokemonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      const input$ = fromEvent(input, 'input').pipe(
        debounceTime(200),
        tap(() => setIsLoading(true)),
        switchMap(() => {
          const query = (input as HTMLInputElement).value.trim().toLowerCase();
          if (query) {
            return fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
              .then(response => {
                if (!response.ok) {
                  throw new Error('Pokemon not found');
                }
                return response.json();
              })
              .then(data => {
                setPokemonData(data);
                setIsLoading(false);
                return true;
              })
              .catch(() => {
                setPokemonData(null);
                setIsLoading(false);
                return false;
              });
          } else {
            setPokemonData(null);
            setIsLoading(false);
            return of(false);
          }
        }),
        catchError(() => {
          setPokemonData(null);
          setIsLoading(false);
          return of(false);
        })
      );

      const subscription = input$.subscribe();

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPokemon(e.target.value);
  };

  const handlePokemonClick = () => {
    if (pokemonData) {
      router.push(`/pokemon/${pokemonData.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md grid gap-4">
        <h1 className="text-3xl font-bold text-center mb-4">Pokédex</h1>
        <input
          ref={inputRef}
          type="text"
          value={pokemon}
          onChange={handleInputChange}
          placeholder="Enter Pokémon name or ID"
          className="w-full p-3 border border-gray-300 rounded-md"
        />
        {isLoading && (
          <div className="w-full text-center p-3">Loading...</div>
        )}
        {pokemonData && (
          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold">{pokemonData.name.toUpperCase()}</h2>
            <img
              src={pokemonData.sprites.front_default}
              alt={pokemonData.name}
              className="w-32 h-32 mx-auto cursor-pointer"
              onClick={handlePokemonClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}
