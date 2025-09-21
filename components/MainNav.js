import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';


export default function MainNav() {
    const { data: session, status } = useSession();

    return (
      <Navbar bg="primary" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="/">WhenWorks</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/about">About</Nav.Link>
          </Nav>
          <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
            {status === 'authenticated' ? (
                <Navbar.Text className="d-flex align-items-center">
                {session.user.image && (
                    <Image
                    src={session.user.image}
                    alt={session.user.name || 'User avatar'}
                    width={32}
                    height={32}
                    style={{ borderRadius: '50%', marginRight: '8px' }}
                    />
                )}
                Signed in as: {session.user.name || session.user.email}
                <a
                    href="#"
                    onClick={(e) => {
                    e.preventDefault();
                    signOut();
                    }}
                    style={{ marginLeft: '12px', color: '#fff' }}
                >
                    Logout
                </a>
                </Navbar.Text>
            ) : (
                <Navbar.Text>
                <a
                    href="#"
                    onClick={(e) => {
                    e.preventDefault();
                    signIn('google');
                    }}
                    style={{ color: '#fff' }}
                >
                    Sign in with Google
                </a>
                </Navbar.Text>
            )}
            </Navbar.Collapse>
        </Container>
      </Navbar>
    )
}