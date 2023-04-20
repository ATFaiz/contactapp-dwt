import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';

export default function Main() {
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const contactsPerPage = 3;

  useEffect(() => {
    const request = window.indexedDB.open('contacts-db', 2);

    request.onerror = function(event) {
      console.error('Database error: ' + event.target.errorCode);
    };

    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['contacts'], 'readonly');
      const store = transaction.objectStore('contacts');

      const request = store.getAll();

      request.onsuccess = function(event) {
        setContacts(event.target.result);
      };
    };

    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      const objectStore = db.createObjectStore('contacts', { keyPath: 'id' });
      objectStore.createIndex('naame', 'naame', { unique: false });
      objectStore.createIndex('email', 'email', { unique: true });
      objectStore.createIndex('mobile', 'mobile', { unique: false });
      objectStore.createIndex('location', 'location', { unique: false });
      objectStore.createIndex('image', 'image', { unique: false });
    };
  }, []);

  const removeContact = (id) => {
    const request = window.indexedDB.open('contacts-db', 2);

    request.onerror = function(event) {
      console.error('Database error: ' + event.target.errorCode);
    };

    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['contacts'], 'readwrite');
      const store = transaction.objectStore('contacts');

      store.delete(id);

      transaction.oncomplete = function() {
        const updatedContacts = contacts.filter((contact) => contact.id !== id);
        setContacts(updatedContacts);
      };
    };
  };

  const handleSearch = (event) => {
    setSearchText(event.target.value);
    setCurrentPage(0);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.naame.toLowerCase().includes(searchText.toLowerCase())
  );

  const pageCount = Math.ceil(filteredContacts.length / contactsPerPage);
  const offset = currentPage * contactsPerPage;
  const currentContacts = filteredContacts.slice(offset, offset + contactsPerPage);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };
    
    return (  
      <div className='m-container'>
        <header className='m-header'>  
          <form className='m-search-bar'>
          <input
            type='search'
            className='m-contact-search'
            name='search-area'
            placeholder='Search Contact'
            value={searchText}
            onChange={handleSearch}
          />
          </form>
          <Link to={'/contact/create'}title="Add a new contact">
          <i className="fas fa-plus-circle m-add"></i>
          </Link>
        </header>
        <section className='m-contacts-library'>

  {currentContacts.length > 0 ? (
    <ul className='m-contacts-list'>
      {currentContacts.map((contact) => (
        <div className='container m-contact-section' key={contact.id}>
          <div className='row'>
          <div className='col-4'>
            <li className='m-list__item'>
            <span className='m-preview'>
            {contact.image && (
                      <img
                        src={contact.image}
                        className='m-img rounded'
                        alt='contact'
                        width={90}
                        height={70}
                      />)}
                    </span>
              <p className='m-bg '>{contact.naame}</p>           
            </li>
            </div>
            <div className='col-8'>
            <li className='m-list__item m-list'>
            <i className='fas fa-phone'>  {contact.mobile}</i>
            <i className='fa fa-envelope-o m-text' title={contact.email}>  {contact.email}</i>
            <br></br>
          </li>
          <li className='m-btn '>
            <Link
                className='btn btn-info'
                to={{ pathname: '/contact/edit/' + contact.id }}>
                Edit 
            </Link>
            <button
                className='btn btn-danger'
                onClick={() => {
                    console.log('concat.id', contact.id);
                    removeContact(contact.id);}}>
              Delete
            </button>
            <Link
                className='btn btn-primary'
                to={{ pathname: '/contact/show/' + contact.id }}>
                Show
            </Link>
         </li>
          </div>
           <hr/>
          </div>
        </div>
      ))}
    </ul>
    
  ) : (
    <p className='m-p2'>Add Contact.</p>
    
  )}
  <div>
<ReactPaginate
       previousLabel={<button className='pervious-button btn'>
       <i className='fa fa-chevron-circle-left' />
     </button>}
       nextLabel={<button className='next-button btn'>
       <i className='fa fa-chevron-circle-right' />
     </button>}
       breakLabel={'...'}
       pageCount={pageCount}
       marginPagesDisplayed={2}
       pageRangeDisplayed={5}
       onPageChange={handlePageChange}
       containerClassName={'pagination'}
       activeClassName={'m-active-link'}
      />
      </div>
 
</section>
      </div>
    );
  }
  