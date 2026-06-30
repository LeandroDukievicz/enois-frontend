const footerLinks = ['Privacidade', 'Termos', 'Contato'];

export const Rodape = () => {
  return (
    <footer className="bg-[#E4E0EE] dark:bg-[#020108] px-6 pb-10 pt-6 shadow-[0_-8px_32px_rgba(0,0,0,0.07)]">
      <div className="mx-auto flex max-w-300 items-center justify-between">
        <p className="text-[13px] font-light text-[#9CA3AF] dark:text-[#6B7280]">
          Conexão | Todos os Direitos Reservados
        </p>
        <nav aria-label="Links do rodapé">
          <ul className="flex items-center gap-8">
            {footerLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-[14px] font-light text-[#6B7280] dark:text-[#9CA3AF] transition-colors hover:text-[#7C3AED]"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
};
