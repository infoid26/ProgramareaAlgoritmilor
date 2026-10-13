"""Validate constructive answers without forcing one reference solution."""
import collections
import json
import re

def check_answer(kind, input_text, actual, expected):
    try:
        closed = kind.endswith('-closed')
        if closed:
            kind = kind.removesuffix('-closed')
        lines = actual.strip().splitlines()
        reference = expected.strip().splitlines()
        if kind == 'codes':
            names = input_text.splitlines()[1:]
            pairs = [line.split() for line in lines]
            valid = len(pairs) == len(names) and all(len(pair) == 2 and pair[0] == name and re.fullmatch(r'[A-Z][a-z]{3}[0-9]{4}', pair[1]) for name, pair in zip(names, pairs))
            return valid, 'Fiecare nume trebuie urmat de un cod: o majusculă, trei minuscule și patru cifre ASCII.'
        if kind == 'text3':
            words = input_text.split()
            if len(lines) < 2 or int(lines[0]) != len(words) or int(lines[1]) != int(reference[1]):
                return False, 'Verifică numărul de cuvinte și numărul minim de eliminări.'
            answer = lines[2:]
            position = 0
            for word in answer:
                while position < len(words) and words[position] != word:
                    position += 1
                if position == len(words):
                    return False, 'Cuvintele păstrate trebuie să respecte ordinea din text.'
                position += 1
            valid = len(answer) == len(words) - int(reference[1]) and all(a[-1] == b[0] for a, b in zip(answer, answer[1:]))
            return valid, 'Afișează câte un cuvânt pe linie și verifică potrivirea dintre ultima și prima literă.'
        if kind == 'set-lines':
            got = [tuple(line.split()) for line in lines]
            want = [tuple(line.split()) for line in reference]
            ok = len(got) == len(set(got)) and set(got) == set(want)
            return ok, 'Verifică soluțiile lipsă, soluțiile în plus și duplicatele.'
        data = input_text.splitlines()
        target = int(reference[0])
        value = int(lines[0])
        if value != target:
            return False, f'Valoarea optimă trebuie să fie {target}; ai afișat {value}.'
        if kind == 'tromino':
            return False, 'Format neașteptat.'
        if kind in ['lis', 'lnds', 'wordchain']:
            source = data[0].split() if kind == 'wordchain' else list(map(int, data[0].split()))
            answer = lines[1].split() if kind == 'wordchain' and len(lines) > 1 else list(map(int, lines[1].split())) if len(lines) > 1 else []
            position = 0
            for x in answer:
                while position < len(source) and source[position] != x:
                    position += 1
                if position == len(source):
                    return False, 'Valorile nu formează un subșir al datelor de intrare în ordinea lor.'
                position += 1
            ordered = all(answer[i][-2:] == answer[i + 1][:2] for i in range(len(answer) - 1)) if kind == 'wordchain' else all(answer[i] < answer[i + 1] if kind == 'lis' else answer[i] <= answer[i + 1] for i in range(len(answer) - 1))
            return len(answer) == target and ordered and len(lines) <= 2, 'Verifică lungimea, ordinea și compatibilitatea elementelor subșirului.'
        if kind == 'robot':
            n, m = map(int, data[0].split())
            matrix = [list(map(int, line.split())) for line in data[1:]]
            path = [tuple(map(int, line.split())) for line in lines[1:]]
            valid = len(path) == n + m - 1 and path[0] == (1, 1) and path[-1] == (n, m) and all(1 <= r <= n and 1 <= c <= m for r, c in path) and all((b[0] - a[0], b[1] - a[1]) in [(1, 0), (0, 1)] for a, b in zip(path, path[1:]))
            return valid and sum(matrix[r - 1][c - 1] for r, c in path) == target, 'Traseul trebuie să lege colțurile, cu pași sud/est, și să aibă suma optimă.'
        if kind == 'triangle':
            n = int(data[0])
            matrix = [list(map(int, line.split())) for line in data[1:]]
            path = list(map(int, lines[1].split()))
            valid = len(lines) == 2 and len(path) == n and path[0] == 0 and all(0 <= c <= r for r, c in enumerate(path)) and all(b - a in [0, 1] for a, b in zip(path, path[1:]))
            return valid and sum(matrix[r][c] for r, c in enumerate(path)) == target, 'Afișează câte o coloană validă pentru fiecare linie a triunghiului.'
        if kind == 'subset':
            values = list(map(int, data[0].split()))
            amount = int(data[1])
            if target == -1:
                return len(lines) == 1, 'Fără soluție afișează numai -1.'
            indices = list(map(int, lines[1].split())) if len(lines) > 1 else []
            valid = len(lines) <= 2 and len(indices) == len(set(indices)) and all(1 <= i <= len(values) for i in indices)
            return valid and sum(values[i - 1] for i in indices) == amount, 'Indicii trebuie să fie distincți și valorile alese să aibă suma cerută.'
        if kind == 'vectors':
            n, amount = map(int, data[0].split())
            if target == 0:
                return len(lines) == 1, 'Fără soluție afișează numai 0.'
            answer = list(map(int, lines[1].split())) if len(lines) > 1 else []
            vectors = [list(map(int, line.split())) for line in data[1:]]
            return len(lines) <= 2 and len(answer) == n and sum(answer) == amount and all(x in vectors[i] for i, x in enumerate(answer)), 'Alege exact o valoare din fiecare vector, în ordinea vectorilor, cu suma cerută.'
        if kind in ['knapsack', 'jobs', 'activities', 'cubes', 'weighted', 'partition']:
            indices = list(map(int, lines[1].split())) if len(lines) > 1 else []
            rows = [tuple(map(int, line.split())) for line in data[1:]]
            if kind == 'partition':
                values = list(map(int, data[0].split()))
                if len(set(indices)) != len(indices) or any(i < 1 or i > len(values) for i in indices):
                    return False, 'Indicii cadourilor trebuie să fie distincți și valizi.'
                chosen = sum(values[i - 1] for i in indices)
                return abs(sum(values) - 2 * chosen) == target and len(lines) <= 2, 'Împărțirea nu realizează diferența minimă.'
            if len(set(indices)) != len(indices) or any(i < 1 or i > len(rows) for i in indices) or len(lines) > 2:
                return False, 'Afișează indici distincți, de la 1 la n, pe a doua linie.'
            selected = [rows[i - 1] for i in indices]
            if kind == 'knapsack':
                capacity = int(data[0].split()[1])
                return sum(r[0] for r in selected) <= capacity and sum(r[1] for r in selected) == target, 'Obiectele alese depășesc capacitatea sau nu au valoarea optimă.'
            if kind == 'jobs':
                return all(index + 1 <= row[1] for index, row in enumerate(selected)) and sum(row[0] for row in selected) == target, 'Respectă termenele limită și profitul total al lucrărilor.'
            if kind == 'activities':
                return len(indices) == target and all(a[1] < b[0] if closed else a[1] <= b[0] for a, b in zip(selected, selected[1:])), 'Activitățile trebuie să fie compatibile și afișate în ordinea executării.'
            if kind == 'cubes':
                return sum(row[0] for row in selected) == target and all(a[0] > b[0] and a[1] != b[1] for a, b in zip(selected, selected[1:])), 'Turnul trebuie să aibă laturi strict descrescătoare și culori consecutive diferite.'
            if kind == 'weighted':
                elapsed = total = 0
                for duration, weight in selected:
                    elapsed += duration
                    total += elapsed * weight
                return len(indices) == len(rows) and total == target, 'Folosește fiecare activitate exact o dată și verifică suma ponderată a finalizărilor.'
        if kind == 'segment':
            values = list(map(int, data[0].split()))
            left, right = map(int, lines[1].split())
            return len(lines) == 2 and 0 <= left <= right < len(values) and sum(values[left:right + 1]) == target, 'Segmentul trebuie să fie nevid, cu indici valizi de la 0, și suma optimă.'
        if kind == 'coins':
            coins = list(map(int, data[0].split()))
            amount = int(data[1])
            chosen = list(map(int, lines[1].split())) if len(lines) > 1 else []
            if target == -1:
                return len(lines) == 1, 'Pentru suma imposibilă afișează numai -1.'
            return len(chosen) == target and sum(chosen) == amount and all(c in coins for c in chosen) and len(lines) <= 2, 'Verifică numărul, suma și valorile monedelor alese.'
        if kind == 'points':
            points = list(map(int, lines[1].split())) if len(lines) > 1 else []
            intervals = [tuple(map(int, line.split())) for line in data[1:]]
            return len(points) == target and len(set(points)) == target and all(any(a <= p <= b for p in points) for a, b in intervals) and len(lines) <= 2, 'Fiecare interval trebuie acoperit de cel puțin un punct; folosește numărul minim.'
        if kind == 'rooms':
            rooms = list(map(int, lines[1].split())) if len(lines) > 1 else []
            intervals = [tuple(map(int, line.split())) for line in data[1:]]
            valid = len(rooms) == len(intervals) and all(1 <= r <= target for r in rooms) and len(lines) <= 2
            if valid:
                valid = all(rooms[i] != rooms[j] or (max(intervals[i][0], intervals[j][0]) > min(intervals[i][1], intervals[j][1]) if closed else max(intervals[i][0], intervals[j][0]) >= min(intervals[i][1], intervals[j][1])) for i in range(len(rooms)) for j in range(i))
            return valid, 'Două activități care se suprapun nu pot folosi aceeași sală.'
        if kind == 'rectangle':
            outer = list(map(int, data[0].split()))
            left, bottom, right, top = map(int, lines[1].split())
            holes = [tuple(map(int, line.split())) for line in data[2:]]
            valid = len(lines) == 2 and outer[0] <= left < right <= outer[2] and outer[1] <= bottom < top <= outer[3] and (right - left) * (top - bottom) == target and all(not (left < x < right and bottom < y < top) for x, y in holes)
            return valid, 'Dreptunghiul trebuie să fie în placă, fără găuri în interior și cu arie maximă.'
        return False, 'Tip de verificare necunoscut.'
    except (ValueError, IndexError, TypeError):
        return False, 'Format incorect. Respectă liniile și tipurile cerute în enunț.'

def check_tromino(input_text, actual):
    try:
        n, hole_r, hole_c = map(int, input_text.split())
        size = 2 ** n
        matrix = [list(map(int, line.split())) for line in actual.strip().splitlines()]
        if len(matrix) != size or any(len(row) != size for row in matrix):
            return False, 'Matricea trebuie să aibă exact 2^n linii și coloane.'
        groups = collections.defaultdict(list)
        for r, row in enumerate(matrix, 1):
            for c, value in enumerate(row, 1):
                groups[value].append((r, c))
        valid = groups.pop(0, []) == [(hole_r, hole_c)] and all(value > 0 and len(cells) == 3 and max(r for r, c in cells) - min(r for r, c in cells) == 1 and max(c for r, c in cells) - min(c for r, c in cells) == 1 for value, cells in groups.items())
        return valid, 'Fiecare piesă are un număr pozitiv unic și ocupă trei celule în formă de L; numai gaura este 0.'
    except (ValueError, IndexError):
        return False, 'Afișează o matrice de numere întregi.'
