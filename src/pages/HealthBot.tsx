import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Send, ShoppingCart, Package, Bot, Loader2, Stethoscope, AlertTriangle, Info } from 'lucide-react';
import { useStore } from '../store';
import { productsData } from '../data/products';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  severity?: 'low' | 'medium' | 'high';
  recommendations?: {
    products?: Array<{
      id: string;
      name: string;
      price: number;
      category: string;
      image: string;
      description: string;
      conditions: string[];
      dosage: string;
      sideEffects: string[];
    }>;
    precautions?: string[];
    doctorConsultation?: boolean;
    urgency?: string;
  };
}

const mockAssistantResponse = (userInput: string): Message => {
  const input = userInput.toLowerCase();
  let response: Message = {
    id: Date.now().toString(),
    role: 'assistant',
    content: '',
    recommendations: {
      products: [],
      precautions: [],
      doctorConsultation: false
    }
  };

  // Check for emergency situations first
  if (input.includes('chest pain') || input.includes('difficulty breathing') || input.includes('severe pain')) {
    response.severity = 'high';
    response.content = "This could be a serious condition. Please seek immediate medical attention.";
    response.recommendations = {
      products: [],
      precautions: [],
      doctorConsultation: true,
      urgency: 'emergency'
    };
  }
  // Common symptoms
  else if (input.includes('cold') || input.includes('flu') || input.includes('cough')) {
    response.severity = 'low';
    response.content = "You may be experiencing cold or flu symptoms. Here are some recommendations.";
    response.recommendations = {
      products: [
        productsData.medicines.find(p => p.id === 'med4')!,
        productsData.medicines.find(p => p.id === 'med5')!
      ],
      precautions: [
        'Drink warm fluids',
        'Rest and avoid overexertion',
        'Use a humidifier to ease congestion'
      ],
      doctorConsultation: false
    };
  } else if (input.includes('stomach ache') || input.includes('indigestion')) {
    response.severity = 'medium';
    response.content = "It looks like you have stomach discomfort. Here are some products that may help.";
    response.recommendations = {
      products: [
        productsData.medicines.find(p => p.id === 'med6')!,
        productsData.medicines.find(p => p.id === 'med7')!
      ],
      precautions: [
        'Avoid spicy and oily food',
        'Stay hydrated',
        'Try light exercises like walking'
      ],
      doctorConsultation: true
    };
  } else if (input.includes('allergy') || input.includes('rash')) {
    response.severity = 'low';
    response.content = "Allergies can be bothersome. Here are some medicines and precautions to consider.";
    response.recommendations = {
      products: [
        productsData.medicines.find(p => p.id === 'med8')!,
        productsData.medicines.find(p => p.id === 'med9')!
      ],
      precautions: [
        'Avoid exposure to allergens',
        'Use antihistamines as needed',
        'Apply soothing creams for skin rashes'
      ],
      doctorConsultation: false
    };
  } else if (input.includes('fever') || input.includes('sore throat')) {
    response.severity = 'medium';
    response.content = "You might have a viral infection. Here are some recommendations.";
    response.recommendations = {
      products: [
        productsData.medicines.find(p => p.id === 'med1')!,
        productsData.medicines.find(p => p.id === 'med2')!
      ],
      precautions: [
        'Rest adequately',
        'Stay hydrated',
        'Monitor temperature regularly'
      ],
      doctorConsultation: true
    };
  } else {
    response.content = "I'm here to help. Could you please provide more details about your symptoms?";
  }

  return response;
};

const HealthBot: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Hello! I am your health assistant. Please describe your symptoms, and I will provide recommendations.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const addToCart = useStore((state) => state.addToCart);
  const cart = useStore((state) => state.cart);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAddToCart = (product: Message['recommendations']['products'][0]) => {
    if (product) addToCart(product);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const response = mockAssistantResponse(input);
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-12">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bot className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Health Assistant</h2>
        </div>
        
        <div className="overflow-y-auto h-[60vh] space-y-4 mb-4 border rounded-lg p-4">
          {messages.map(msg => (
            <div key={msg.id} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-blue-50' : 'bg-white border border-gray-200'}`}>
              {msg.severity && (
                <div className={`flex items-center gap-2 mb-2`}>
                  {msg.severity === 'low' && (
                    <Info className="h-5 w-5 text-green-500" />
                  )}
                  {msg.severity === 'medium' && (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  {msg.severity === 'high' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${msg.severity === 'low' ? 'text-green-600' : msg.severity === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {msg.severity.charAt(0).toUpperCase() + msg.severity.slice(1)} Priority
                  </span>
                </div>
              )}
              <p className="mb-2">{msg.content}</p>
              
              {msg.recommendations?.products?.length ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Recommended Medicines:</h3>
                  {msg.recommendations.products.map(product => (
                    <div key={product.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">${product.price}</p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={cart.some(item => item.id === product.id)}
                        className={`px-4 py-1 rounded ${cart.some(item => item.id === product.id) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      >
                        {cart.some(item => item.id === product.id) ? 'Added' : 'Add to Cart'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              {msg.recommendations?.precautions?.length ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Precautions:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {msg.recommendations.precautions.map((precaution, index) => (
                      <li key={index} className="text-sm text-gray-600">{precaution}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {msg.recommendations?.doctorConsultation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Consult a doctor for proper diagnosis and treatment
                    </span>
                  </div>
                </div>
              )}

              {msg.recommendations?.urgency === 'emergency' && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-red-600 animate-pulse" />
                    <span className="text-sm font-bold text-red-600">
                      Emergency Situation! Seek immediate medical help!
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms..."
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HealthBot;