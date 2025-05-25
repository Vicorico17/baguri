import { ProductSubmissionForm } from '@/components/ProductSubmissionForm';

export default function ProductAutomationDemo() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Automated Stripe Integration Demo
            </h1>
            <p className="text-xl text-zinc-400 mb-6">
              When authenticated designers submit products, Stripe integration is created automatically
            </p>
            <div className="flex justify-center gap-4 text-sm text-zinc-500">
              <span>✅ Designer Authentication</span>
              <span>✅ Real Stripe Products</span>
              <span>✅ Real Payment Links</span>
              <span>✅ RON Currency</span>
              <span>✅ Automated Process</span>
            </div>
          </div>

          {/* Process Flow */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-zinc-900 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">🎯 Old Manual Flow</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Designer manually enters name</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Admin manually creates Stripe product</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Admin manually creates Stripe price</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <span>Admin manually creates payment link</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                  <span>Admin manually updates mapping</span>
                </div>
              </div>
              <p className="text-red-400 text-xs mt-4">❌ Manual, slow, error-prone, no authentication</p>
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">🚀 New Authenticated Flow</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Designer logs in (authenticated)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>System auto-creates Stripe product</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>System auto-creates Stripe price</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <span>System auto-creates payment link</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                  <span>Product attributed to designer ID</span>
                </div>
              </div>
              <p className="text-green-400 text-xs mt-4">✅ Automated, fast, reliable, secure authentication</p>
            </div>
          </div>

          {/* Authentication Features */}
          <div className="bg-zinc-900 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold mb-4">🔐 Authentication Features</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h3 className="font-medium text-blue-400">Designer Verification</h3>
                <ul className="space-y-1 text-zinc-400">
                  <li>• Only verified designers can submit</li>
                  <li>• Automatic profile attribution</li>
                  <li>• Designer ID tracking</li>
                  <li>• Bio and social links</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-green-400">Session Management</h3>
                <ul className="space-y-1 text-zinc-400">
                  <li>• Persistent login state</li>
                  <li>• Designer switching (demo)</li>
                  <li>• Automatic session restoration</li>
                  <li>• Secure logout</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-purple-400">Product Attribution</h3>
                <ul className="space-y-1 text-zinc-400">
                  <li>• Products linked to designer ID</li>
                  <li>• Automatic designer name</li>
                  <li>• Designer profile integration</li>
                  <li>• Verification status checks</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Demo Form */}
          <ProductSubmissionForm />

          {/* Code Example */}
          <div className="mt-12 bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">📝 Updated Code Example</h2>
            <div className="text-sm text-zinc-400 space-y-4">
              <div>
                <p className="text-blue-400 mb-2">// Authentication Hook (src/hooks/useAuth.ts)</p>
                <pre className="bg-zinc-800 p-4 rounded text-xs overflow-x-auto">
{`export function useAuth() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    designer: null,
    isLoading: true
  });
  
  // Check for existing session, handle login/logout
  // Return designer info from authenticated session
}`}
                </pre>
              </div>
              
              <div>
                <p className="text-green-400 mb-2">// Product Submission (src/components/ProductSubmissionForm.tsx)</p>
                <pre className="bg-zinc-800 p-4 rounded text-xs overflow-x-auto">
{`export function ProductSubmissionForm() {
  const { designer, isAuthenticated } = useAuth();
  
  const handleSubmit = async (e) => {
    if (!designer) {
      throw new Error('Designer authentication required');
    }
    
    const productData = {
      ...formData,
      designerName: designer.name,     // From auth
      designerId: designer.id,         // From auth
    };
    
    await createStripeProductAction(productData);
  };
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Authentication Demo */}
          <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">🎭 Demo Authentication</h2>
            <p className="text-zinc-300 mb-4">
              This demo includes multiple designer profiles to showcase the authentication system:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-zinc-800 p-3 rounded">
                <h3 className="font-medium text-green-400 mb-2">Elena Popescu</h3>
                <ul className="space-y-1 text-zinc-400">
                  <li><strong>Status:</strong> ✓ Verified</li>
                  <li><strong>Focus:</strong> Sustainable luxury</li>
                  <li><strong>Can Submit:</strong> Yes</li>
                </ul>
              </div>
              <div className="bg-zinc-800 p-3 rounded">
                <h3 className="font-medium text-green-400 mb-2">Andrei Munteanu</h3>
                <ul className="space-y-1 text-zinc-400">
                  <li><strong>Status:</strong> ✓ Verified</li>
                  <li><strong>Focus:</strong> Experimental textiles</li>
                  <li><strong>Can Submit:</strong> Yes</li>
                </ul>
              </div>
              <div className="bg-zinc-800 p-3 rounded">
                <h3 className="font-medium text-yellow-400 mb-2">Maria Ionescu</h3>
                <ul className="space-y-1 text-zinc-400">
                  <li><strong>Status:</strong> ⏳ Pending</li>
                  <li><strong>Focus:</strong> Traditional crafts</li>
                  <li><strong>Can Submit:</strong> No (needs verification)</li>
                </ul>
              </div>
            </div>
            <p className="text-zinc-400 text-xs mt-4">
              Use the dropdown in the form above to switch between different designer profiles and see how verification affects submission capability.
            </p>
          </div>

          {/* Admin Workflow */}
          <div className="mt-8 bg-zinc-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">👨‍💼 Admin Workflow</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">1</div>
                <div>
                  <h3 className="font-medium">Designer Registration</h3>
                  <p className="text-zinc-400">Designer signs up → Admin reviews portfolio → Approves verification</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">2</div>
                <div>
                  <h3 className="font-medium">Product Submission</h3>
                  <p className="text-zinc-400">Verified designer submits → Auto Stripe creation → Product queued for approval</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">3</div>
                <div>
                  <h3 className="font-medium">Product Approval</h3>
                  <p className="text-zinc-400">Admin reviews product → Approves → Product goes live with working payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 