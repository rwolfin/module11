const fruitsList = document.querySelector('.fruits__list');
const shuffleButton = document.querySelector('.shuffle__btn');
const filterButton = document.querySelector('.filter__btn');
const sortKindLabel = document.querySelector('.sort__kind');
const sortTimeLabel = document.querySelector('.sort__time');
const sortChangeButton = document.querySelector('.sort__change__btn');
const sortActionButton = document.querySelector('.sort__action__btn');
const kindInput = document.querySelector('.kind__input');
const colorInput = document.querySelector('.color__input');
const weightInput = document.querySelector('.weight__input');
const addActionButton = document.querySelector('.add__action__btn');
const minWeightInput = document.querySelector('.minweight__input');
const maxWeightInput = document.querySelector('.maxweight__input');

const colorClassMap = {
  'фиолетовый': 'violet',
  'зеленый': 'green',
  'розово-красный': 'carmazin',
  'желтый': 'yellow',
  'светло-коричневый': 'lightbrown',
  'розовый': 'pink',
  'красный': 'red'
};

let fruitsJSON = `[
  {"kind": "Мангустин", "color": "фиолетовый", "weight": 13},
  {"kind": "Дуриан", "color": "зеленый", "weight": 35},
  {"kind": "Личи", "color": "розово-красный", "weight": 17},
  {"kind": "Карамбола", "color": "желтый", "weight": 28},
  {"kind": "Тамаринд", "color": "светло-коричневый", "weight": 22}
]`;

let fruits = [];
let originalFruits = [];

try {
    fruits = JSON.parse(fruitsJSON);
    originalFruits = JSON.parse(fruitsJSON);
} catch (e) {
    console.error("Ошибка при парсинге JSON:", e);
    alert("Ошибка: Некорректные данные JSON!");
    fruits = [];
    originalFruits = [];
}

/*** ОТОБРАЖЕНИЕ ***/
const display = () => {
  fruitsList.innerHTML = '';

  for (let i = 0; i < fruits.length; i++) {
    const li = document.createElement('li');
    const baseColor = fruits[i].color.toLowerCase().trim();
    const colorClass = colorClassMap[baseColor] || 'default';

    // Формируем валидный CSS класс
    const sanitizedClass = `fruit__item fruit_${colorClass.replace(/\s+/g, '-')}`; // Исправлено здесь
    li.className = sanitizedClass;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'fruit__info';
    infoDiv.innerHTML = `
      <div>index: ${i}</div>
      <div>kind: ${fruits[i].kind}</div>
      <div>color: ${fruits[i].color}</div>
      <div>weight (кг): ${fruits[i].weight}</div>
    `;

    li.appendChild(infoDiv);
    fruitsList.appendChild(li);
  }
};


/*** ПЕРЕМЕШИВАНИЕ ***/
const getRandomInt = (max) => Math.floor(Math.random() * (max + 1));

const shuffleFruits = () => {
  const original = [...fruits];
  for (let i = fruits.length - 1; i > 0; i--) {
    const j = getRandomInt(i);
    [fruits[i], fruits[j]] = [fruits[j], fruits[i]];
  }
};

shuffleButton.addEventListener('click', () => {
  const beforeShuffle = JSON.stringify(fruits);
  shuffleFruits();
  display();
  const afterShuffle = JSON.stringify(fruits);
  if (beforeShuffle === afterShuffle) {
    alert('Порядок не изменился!');
  }
});

/*** ФИЛЬТРАЦИЯ ***/
const filterFruits = () => {
  const min = Number(minWeightInput.value) || 0;
  const max = Number(maxWeightInput.value) || Infinity;

  fruits = originalFruits.filter(fruit =>
    fruit.weight >= min && fruit.weight <= max
  );
};

filterButton.addEventListener('click', () => {
  filterFruits();
  display();
});

/*** СОРТИРОВКА ***/
let sortKind = 'bubbleSort';
let sortTime = '-';

const priority = {
  'красный': 1,
  'розово-красный': 2,
  'желтый': 3,
  'зеленый': 4,
  'фиолетовый': 5,
  'светло-коричневый': 6,
  'розовый': 7
};

const comparationColor = (a, b) => {
  return (priority[a.color] || Infinity) - (priority[b.color] || Infinity);
};

const sortAPI = {
  bubbleSort(arrayToSort, comparation) {
    for (let i = 0; i < arrayToSort.length; i++) {
      for (let j = 0; j < arrayToSort.length - 1; j++) {
        if (comparation(arrayToSort[j], arrayToSort[j + 1]) > 0) {
          [arrayToSort[j], arrayToSort[j + 1]] = [arrayToSort[j + 1], arrayToSort[j]];
        }
      }
    }
  },

  quickSort(arrayToSort, comparation) {
    if (arrayToSort.length <= 1) return arrayToSort;
    const pivot = arrayToSort[0];
    const left = [];
    const right = [];

    for (let i = 1; i < arrayToSort.length; i++) {
      comparation(arrayToSort[i], pivot) < 0 ? left.push(arrayToSort[i]) : right.push(arrayToSort[i]);
    }

    return [...this.quickSort(left, comparation), pivot, ...this.quickSort(right, comparation)];
  },

  startSort(sort, arrayToSort, comparation) {
    const start = performance.now();
    if (sort === this.quickSort) {
      fruits = sort.call(this, arrayToSort, comparation);
    } else {
      sort(arrayToSort, comparation);
    }
    const end = performance.now();
    sortTime = `${(end - start).toFixed(1)} ms`;
  },
};

sortChangeButton.addEventListener('click', () => {
  sortKind = sortKind === 'bubbleSort' ? 'quickSort' : 'bubbleSort';
  sortKindLabel.textContent = sortKind;
});

sortActionButton.addEventListener('click', () => {
  sortTimeLabel.textContent = 'sorting...';
  setTimeout(() => {
    const sort = sortAPI[sortKind];
    sortAPI.startSort(sort, fruits, comparationColor);
    display();
    sortTimeLabel.textContent = sortTime;
  }, 0);
});

/*** ДОБАВИТЬ ФРУКТ ***/
addActionButton.addEventListener('click', () => {
  const kind = kindInput.value.trim();
  const color = colorInput.value.trim();
  const weight = Number(weightInput.value.trim());

  if (!kind || !color || isNaN(weight) || weight <= 0) {
    alert('Все поля должны быть заполнены корректно!');
    return;
  }

  originalFruits.push({kind, color, weight}); // Добавляем в originalFruits
  fruits.push({kind, color, weight});
  kindInput.value = '';
  colorInput.value = '';
  weightInput.value = '';
  display();
});

// Инициализация полей сортировки
sortKindLabel.textContent = sortKind;
sortTimeLabel.textContent = sortTime;

display(); // <--- Вызываем display() здесь, после инициализации данных

