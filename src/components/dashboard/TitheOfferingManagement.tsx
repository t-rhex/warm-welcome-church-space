import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";

const TitheOfferingManagement = () => {
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    service_date: new Date().toISOString().split('T')[0],
    service_type: 'sunday_morning',
    category_id: '',
    amount: '',
    payment_method: 'cash',
    notes: ''
  });

  useEffect(() => {
    fetchCollections();
    fetchCategories();
  }, []);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('tithe_offerings')
        .select(`
          *,
          category:tithe_offering_categories(name),
          verifications:tithe_offering_verifications(
            id,
            verified_by,
            verified_at
          )
        `)
        .order('service_date', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: "Error fetching collections",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('tithe_offering_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('tithe_offerings')
        .insert([{
          ...formData,
          amount: parseFloat(formData.amount),
          created_by: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Collection recorded",
        description: "The collection has been recorded successfully.",
      });

      // Reset form
      setFormData({
        service_date: new Date().toISOString().split('T')[0],
        service_type: 'sunday_morning',
        category_id: '',
        amount: '',
        payment_method: 'cash',
        notes: ''
      });
      
      fetchCollections();
    } catch (error) {
      console.error('Error recording collection:', error);
      toast({
        title: "Error recording collection",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (collectionId: string) => {
    try {
      const { error } = await supabase
        .from('tithe_offering_verifications')
        .insert([{
          tithe_offering_id: collectionId,
          verified_by: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Collection verified",
        description: "Your verification has been recorded.",
      });

      fetchCollections();
    } catch (error) {
      console.error('Error verifying collection:', error);
      toast({
        title: "Error verifying collection",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatServiceType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Record Tithe & Offering</CardTitle>
          <CardDescription>Record collections from church services</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="serviceDate">Service Date</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={formData.service_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <select
                  id="serviceType"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.service_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                  required
                >
                  <option value="sunday_morning">Sunday Morning</option>
                  <option value="sunday_evening">Sunday Evening</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="special">Special Service</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.payment_method}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                required
              >
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes..."
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record Collection"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Collections List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Collections</CardTitle>
          <CardDescription>View and verify recent collections</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading collections...</div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Collections Recorded</h3>
              <p className="text-muted-foreground">
                Start by recording your first collection
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">
                          {formatServiceType(collection.service_type)}
                        </h3>
                        <Badge variant={
                          collection.status === 'finalized' ? 'default' :
                          collection.status === 'verified' ? 'secondary' :
                          'outline'
                        }>
                          {collection.status}
                        </Badge>
                        <Badge variant="outline">
                          {collection.category.name}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(collection.service_date)}
                        </span>
                        <span className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          ${collection.amount.toLocaleString()}
                        </span>
                      </div>
                      {collection.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {collection.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {collection.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleVerify(collection.id)}
                          disabled={collection.verifications.some(v => v.verified_by === user?.id)}
                          className="bg-church-600 hover:bg-church-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Verification Status */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Verifications:</span>
                    <div className="flex gap-2">
                      {[...Array(2)].map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            collection.verifications[index]
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground">
                      ({collection.verifications.length}/2 required)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TitheOfferingManagement;