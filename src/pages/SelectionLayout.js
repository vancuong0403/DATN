import { Outlet } from 'react-router-dom';

const SectionLayout = () => (
  <section className='container'>
    <Outlet />
  </section>
);

export default SectionLayout;