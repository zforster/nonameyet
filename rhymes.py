import requests


class Rhymes:
    def __init__(self):
        self._api_base = "https://api.rhymezone.com/words?arhy=1&max=1000&qe=sl&sl={}"

    def get_rhymes(self, word: str):
        rhymes = requests.get(self._api_base.format(word))
        rhymes_dict = rhymes.json()
        for res in rhymes_dict:
            res['word'] = res['word'].replace("'", '')
        return rhymes_dict
