import React from 'react';

const AppFooter = ({ compact = false }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`flex-none text-center mt-auto text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
        compact
          ? 'px-3 py-1.5 text-[11px] sm:py-2 sm:text-xs leading-tight'
          : 'py-4 text-sm'
      }`}
    >
      <p className={compact ? 'leading-tight' : undefined}>
        &copy; {currentYear}{' '}
        <a
          href="https://falker47.github.io/Nexus-portfolio/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-cah-accent-dark dark:text-cah-accent-light"
        >
          Maurizio Falconi @falker47
        </a>
      </p>
      <p className={compact ? 'mt-0.5 text-[10px] leading-tight sm:text-[11px]' : 'mt-1 text-xs'}>
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
