import React from 'react';

const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-center py-4 mt-auto text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <p>
        Codice &copy; {currentYear}{' '}
        <a
          href="https://falker47.github.io/Nexus-portfolio/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-cah-accent-dark dark:text-cah-accent-light"
        >
          Maurizio Falconi @falker47
        </a>
      </p>
      <p className="mt-1 text-xs">
        Fan project non commerciale · Mazzo{' '}
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/2.0/it/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          CC BY-NC-SA 2.0 IT
        </a>
        {' '}· Non affiliato a Cards Against Humanity
      </p>
    </footer>
  );
};

export default AppFooter;
