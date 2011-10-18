<?php

namespace Unglued\GmgyBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Unglued\GmgyBundle\Entity\Product;
use Unglued\GmgyBundle\Entity\Category;

use Symfony\Component\HttpFoundation\Response;

//include('../Entity/Product.php');

class DefaultController extends Controller
{
    
    public function indexAction()
    {
        return $this->render('UngluedGmgyBundle:Default:index.html.twig', array('name' => 'name'));
    }
		
		public function aboutAction(){
        return $this->render('UngluedGmgyBundle:Default:about.html.twig');
    }
		
		public function createAction(){
			$product = new Product();
			$product->setName('A Foo Bar');
			$product->setPrice('19.99');
			$product->setDescription('Lorem Ipsum Dolor');
			
			$em = $this->getDoctrine()->getEntityManager();
			$em->persist($product);
			$em->flush();
			
			$data = 'Created product id ' . $product->getId();
			return $this->render('UngluedGmgyBundle:Default:about.html.twig', array('data'=>$data));
		}
		
		public function showAction($id){
			$product = $this->getDoctrine()
				->getRepository('UngluedGmgyBundle:Product')
				->find($id);
				
			if(!$product) throw $this->createNotFoundException('No product found for id '.$id);
			
			$data = 'Found product with id ' . $product->getId() . ': '.$product->getName();
			return $this->render('UngluedGmgyBundle:Default:about.html.twig', array('data'=>$data));
		}
		
		public function updateAction($id){
			$em = $this->getDoctrine()->getEntityManager();
			$product = $em->getRepository('UngluedGmgyBundle:Product')->find($id);
			
			if(!$product) throw $this->createNotFoundException('No product found for id '.$id);
			
			$product->setName('New product name');
			$em->flush();
			
			return $this->redirect($this->generateUrl('_db_show', array('id'=>1)));
		}
		
		public function createProductAction(){
			
		}
}