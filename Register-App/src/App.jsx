import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import abi from './abi.json';

const RegisterApp = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({
    id: '',
    name: '',
    age: ''
  });


  const contractAddress = "0x50d032d1D1bD62d59CF4Fd9fCE504269324492EB";
  const contractABI = abi; 

  const connectWallet = async () => {
    try {
      setLoading(true);
      
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        setProvider(provider);
        setContract(contract);
        setAccount(accounts[0]);
        toast.success('Wallet connected successfully!');
      } else {
        toast.error("Please install MetaMask!");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setContract(null);
    setAccount('');
    toast.info('Wallet disconnected');
  };

  const registerStudent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const tx = await contract.registerStudent(
        parseInt(newStudent.id),
        newStudent.name,
        parseInt(newStudent.age)
      );
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      await tx.wait();
      toast.success('Student registered successfully!');
      
      setNewStudent({ id: '', name: '', age: '' });
      await loadStudents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const nextId = await contract.nextId();
      const loadedStudents = [];
      
      for (let i = 0; i < nextId; i++) {
        try {
          const [name, age] = await contract.getStudent(i);
          if (name !== '') {
            loadedStudents.push({ id: i, name, age: age.toString() });
          }
        } catch (err) {
          console.error(`Error loading student ${i}:`, err);
        }
      }
      
      setStudents(loadedStudents);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeStudent = async (id) => {
    try {
      setLoading(true);
      
      const tx = await contract.removeStudent(id);
      toast.info('Removing student...');
      await tx.wait();
      toast.success('Student removed successfully!');
      
      await loadStudents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      loadStudents();
    }
  }, [contract]);

  return (
    <div className="app-container">
      <div className="app-card">
        <h1>Student Registration DApp</h1>
        
        <div className="wallet-section">
          {!account ? (
            <button 
              className="connect-btn"
              onClick={connectWallet} 
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="wallet-info">
              <span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
              <button 
                className="disconnect-btn"
                onClick={disconnectWallet}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        <form onSubmit={registerStudent} className="register-form">
          <div className="form-group">
            <label htmlFor="id">Student ID:</label>
            <input
              id="id"
              type="number"
              value={newStudent.id}
              onChange={(e) => setNewStudent({...newStudent, id: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              value={newStudent.name}
              onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="age">Age:</label>
            <input
              id="age"
              type="number"
              value={newStudent.age}
              onChange={(e) => setNewStudent({...newStudent, age: e.target.value})}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={!account || loading}
          >
            {loading ? 'Registering...' : 'Register Student'}
          </button>
        </form>

        <div className="students-list">
          <h2>Registered Students</h2>
          {students.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-info">
                <p><strong>ID:</strong> {student.id}</p>
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Age:</strong> {student.age}</p>
              </div>
              <button
                className="remove-btn"
                onClick={() => removeStudent(student.id)}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default RegisterApp;