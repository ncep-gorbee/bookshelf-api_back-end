const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  // mengecek apakah terdapat nama buku
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // mengecek apakah readPage lebih besar daripada pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
  };

  books.push(newBook);

  // mengecek apakah buku sudah sukses ditambahkan
  const isSuccess = books.some((book) => book.id === id);

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: { bookId: id },
    });
    response.code(201);
    return response;
  }

  // Default error jika buku tidak sukses ditambahkan
  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { reading, finished, name } = request.query; // mengganti `params` ke `query` (untuk praktik REST API yg lebih baik)
  let filteredBooks = books;

  // memfilter buku berdasarkan `reading` query parameter, jika ada
  if (reading === '1') {
    filteredBooks = books.filter((book) => book.reading === true);
  } else if (reading === '0') {
    filteredBooks = books.filter((book) => book.reading === false);
  } else if (finished === '1') {
    filteredBooks = books.filter((book) => book.finished === true);
  } else if (finished === '0') {
    filteredBooks = books.filter((book) => book.finished === false);
  } else if (name !== undefined) {
    filteredBooks = books.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
  }

  // mapping data buku yg sudah difilter untuk mengembalikan nilai yg diinginkan
  const booksData = filteredBooks.map(({ id, name, publisher }) => ({
    id,
    name,
    publisher,
  }));

  const response = h.response({
    status: 'success',
    data: {
      books: booksData,
    },
  });

  response.code(200);
  return response;
};

/*const getAllBooksHandler = (request, h) => {
  const response = h.response({
    status: 'success',
    data: {
      books: books.map(({ id, name, publisher }) => ({
        id,
        name,
        publisher,
      })),
    },
  });

  const { reading } = request.params;
  // nilai '1' berarti true and '0' berarti false
  const readingValue = reading === '1';
  const notReadingValue = reading === '0'; 

  // memfilter buku berdasarkan properti reading
  const filteredBooks = books
    .filter((book) => book.reading === readingValue)
    .map(({ id, name, publisher }) => ({ id, name, publisher })); // hanya menampilkan spesifik data saja
    .filter((book) => book.reading === notReadingValue)
    .map(({ id, name, publisher }) => ({ id, name, publisher })); // hanya menampilkan spesifik data saja

  response.code(200);
  return response;
};*/

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.filter((n) => n.id === bookId)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  // memvalidasi update data buku
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const index = books.findIndex((book) => book.id === bookId);
  const updatedAt = new Date().toISOString();

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name, year, author, summary, publisher, pageCount, readPage, reading, updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

/*const getBookByReadingHandler = (request, h) => {
  const { reading } = request.params;
  // nilai '1' berarti true and '0' berarti false
  const readingValue = reading === '1';
  const notReadingValue = reading === '0'; 

  // memfilter buku berdasarkan properti reading
  const filteredBooks = books
    .filter((book) => book.reading === readingValue)
    .map(({ id, name, publisher }) => ({ id, name, publisher })); // hanya menampilkan spesifik data saja
    .filter((book) => book.reading === notReadingValue)
    .map(({ id, name, publisher }) => ({ id, name, publisher })); // hanya menampilkan spesifik data saja

  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks, // buku yang difiltered dan dimapped
    },
  });

  response.header('Content-Type', 'application/json; charset=utf-8');
  response.code(200);
  return response;
};*/

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({ status: 'success', message: 'Buku berhasil dihapus', });
    response.code(200);
    return response;
  }

  const response = h.response({ status: 'fail', message: 'Buku gagal dihapus. Id tidak ditemukan', });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};