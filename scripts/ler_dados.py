"""Leia uma tabela de estudo e confira suas regras básicas."""

import csv
from pathlib import Path
import sys


COLUNAS = {"id", "text", "label", "origem", "group_id"}
CATEGORIAS = {"acesso", "cobranca", "problema_tecnico"}
PADRAO = Path(__file__).resolve().parents[1] / "data" / "exemplos_estudo.csv"


def ler_dados(caminho):
    with caminho.open(encoding="utf-8-sig", newline="") as arquivo:
        tabela = csv.DictReader(arquivo) # lê o arquivo CSV e retorna um dicionário

        if not tabela.fieldnames or set(tabela.fieldnames) != COLUNAS or len(tabela.fieldnames) != 5:
            raise ValueError("Cabeçalho inválido: use id, text, label, origem, group_id.")
        registros = []
        ids = set()
        for numero, linha in enumerate(tabela, start=2):
            if None in linha or any(valor is None or not valor.strip() for valor in linha.values()):
                raise ValueError(f"Linha {numero}: campos ausentes, vazios ou extras.")
            linha = {chave: valor.strip() for chave, valor in linha.items()} # remove espaços em branco do início e do fim de cada valor
            if linha["id"] in ids:
                raise ValueError(f"Linha {numero}: id repetido.")
            if linha["label"] not in CATEGORIAS:
                raise ValueError(f"Linha {numero}: categoria inválida.")
            if len(linha["text"]) > 2000:
                raise ValueError(f"Linha {numero}: texto maior que 2.000 caracteres.")
            ids.add(linha["id"])
            registros.append(linha)
        if not registros:
            raise ValueError("Tabela sem chamados.")
        return registros


def main():
    caminho = Path(sys.argv[1]) if len(sys.argv) > 1 else PADRAO
    try:
        registros = ler_dados(caminho)
    except (OSError, UnicodeError, csv.Error, ValueError) as erro:
        print(f"Erro ao ler dados: {erro}", file=sys.stderr)
        return 1
    print(f"{len(registros)} chamados válidos carregados.")
    for registro in registros:
        print(f"{registro['id']} | {registro['label']} | {registro['text']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
